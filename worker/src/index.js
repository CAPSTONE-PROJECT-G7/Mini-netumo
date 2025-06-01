const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const fetch   = require('node-fetch');
const redis   = new IORedis('redis://redis:6379');

const checksQ = new Queue('checks', { connection: redis });
const sslQ    = new Queue('ssl',    { connection: redis });

/* ---------- schedule jobs ---------- */
setInterval(async () => {
  const targets = await getActiveTargets();  // call API
  targets.forEach(t => checksQ.add('http', { target: t }));
}, 5 * 60 * 1000);                            // every 5 min

// once per day schedule SSL/WHOIS checks
const msUntilMidnight = () => {
  const now = new Date(); const mid = new Date();
  mid.setUTCHours(24,0,0,0); return mid - now;
};
setTimeout(function daily() {
  getActiveTargets().then(tgts => tgts.forEach(t => sslQ.add('cert', { target: t })));
  setInterval(daily, 24*60*60*1000);
}, msUntilMidnight());

/* ---------- workers ---------- */
new Worker('checks', async job => {
  const { target } = job.data;
  const start = Date.now();
  try {
    const r = await fetch(target.url, { redirect: 'manual', timeout: 10000 });
    await saveHttpResult(target.id, r.status, Date.now() - start);
    if (await isFlapping(target.id)) await raiseAlert(target, 'DOWN', r.status);
  } catch (e) {
    await saveHttpResult(target.id, 0, -1);
    if (await isFlapping(target.id)) await raiseAlert(target, 'DOWN', 0);
    throw e;                                // enable exponential back-off
  }
}, { connection: redis, backoff: { type: 'exponential', delay: 30_000 } });

new Worker('ssl', async job => {
  const { target } = job.data;
  const { daysCert, daysDomain } = await probeExpiry(target.url);
  await saveExpiry(target.id, daysCert, daysDomain);
  if (daysCert <= 14)   await raiseAlert(target, 'SSL', daysCert);
  if (daysDomain <= 14) await raiseAlert(target, 'DOMAIN', daysDomain);
}, { connection: redis });
