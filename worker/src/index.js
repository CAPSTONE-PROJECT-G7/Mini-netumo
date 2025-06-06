const { Queue, Worker } = require('bullmq');
const IORedis           = require('ioredis');
const fetch             = require('node-fetch');
const probeExpiry       = require('./utils/probeExpiry');
const {
  Target, Check, CertStatus, DomainStatus, Alert
} = require('./db');

const redis = new IORedis('redis://redis:6379', {
  maxRetriesPerRequest: null
});

const checksQ = new Queue('checks', { connection: redis });
const sslQ    = new Queue('ssl',    { connection: redis });

/* ── helpers ────────────────────────────────────────────── */
async function getActiveTargets() {
  return Target.findAll({
    where: { paused: false },
    attributes: ['id', 'url', 'label', 'user_id']
  });
}

async function saveHttpResult(targetId, status, latency) {
  await Check.create({ target_id: targetId, status_code: status, latency_ms: latency });
}

async function saveExpiry(targetId, daysCert, daysDomain) {
  await CertStatus.create({ target_id: targetId, days_to_expiry: daysCert });
  await DomainStatus.create({ target_id: targetId, days_to_expiry: daysDomain });
}

async function isFlapping(targetId) {
  const lastTwo = await Check.findAll({
    where: { target_id: targetId },
    order: [['created_at', 'DESC']],
    limit: 2
  });
  if (lastTwo.length < 2) return false;
  /* consider “DOWN” if status_code=0 OR ≥400 */
  const bad = c => !c.status_code || c.status_code >= 400;
  return bad(lastTwo[0]) && bad(lastTwo[1]);
}

async function raiseAlert(target, type, value) {
  await Alert.create({
    user_id:   target.user_id,
    target_id: target.id,
    type,
    message:   `${type} alert – value: ${value}`,
    sent_via:  'pending'
  });

  /* also enqueue a job for notifier service if you have one */
  const alertsQ = new Queue('alerts', { connection: redis });
  await alertsQ.add('notify', { target, type, value });
}
/* ───────────────────────────────────────────────────────── */

/* ---------- schedule jobs ---------- */
setInterval(async () => {
  const targets = await getActiveTargets();
  targets.forEach(t => checksQ.add('http', { target: t }));
}, 5 * 60 * 1000);                // every 5 min

/* schedule SSL/WHOIS once daily */
function scheduleDaily() {
  getActiveTargets()
    .then(tgts => tgts.forEach(t => sslQ.add('cert', { target: t })));
}
const millisToMidnight = () => {
  const now = new Date();
  const mid = new Date(); mid.setUTCHours(24, 0, 0, 0);
  return mid - now;
};
setTimeout(() => {
  scheduleDaily();
  setInterval(scheduleDaily, 24 * 60 * 60 * 1000);
}, millisToMidnight());

/* ---------- worker processors ---------- */
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
    throw e; // exponential back-off
  }
}, { connection: redis, backoff: { type: 'exponential', delay: 30_000 } });

new Worker('ssl', async job => {
  const { target } = job.data;
  const { daysCert, daysDomain } = await probeExpiry(target.url);
  await saveExpiry(target.id, daysCert, daysDomain);
  if (daysCert   <= 14) await raiseAlert(target, 'SSL',    daysCert);
  if (daysDomain <= 14) await raiseAlert(target, 'DOMAIN', daysDomain);
}, { connection: redis });

console.log('Worker online – monitoring every 5 min');
