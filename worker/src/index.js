const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');

// ✅ Fix for fetch in CommonJS
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const { Op } = require('sequelize');
const today = new Date();
today.setUTCHours(0, 0, 0, 0);

const probeExpiry = require('./utils/probeExpiry');
const {
  Target, Check, CertStatus, DomainStatus, Alert,User
} = require('./db');

const redis = new IORedis('redis://redis:6379', {
  maxRetriesPerRequest: null
});

const checksQ = new Queue('checks', { connection: redis });
const sslQ = new Queue('ssl', { connection: redis });

// ✅ Get active targets
async function getActiveTargets() {
  return Target.findAll({
    where: { paused: false },
    attributes: ['id', 'url', 'label', 'user_id'],
    include: [{ model: User, attributes: ['email'] }] // ✅ JOIN with User
  });
}


// ✅ Save HTTP results
async function saveHttpResult(targetId, status, latency) {
  await Check.create({ target_id: targetId, status_code: status, latency_ms: latency });
}

// ✅ Save SSL and Domain expiry
async function saveExpiry(targetId, daysCert, daysDomain) {
  await CertStatus.create({ target_id: targetId, days_to_expiry: daysCert });
  await DomainStatus.create({ target_id: targetId, days_to_expiry: daysDomain });
}

// ✅ Detect flapping (2 consecutive bad results)
async function isFlapping(targetId) {
  const lastTwo = await Check.findAll({
    where: { target_id: targetId },
    order: [['created_at', 'DESC']],
    limit: 2
  });

  if (lastTwo.length < 2) return false;

  const bad = c => !c.status_code || c.status_code >= 400;
  return bad(lastTwo[0]) && bad(lastTwo[1]);
}

// ✅ Raise alert if not already exists
async function raiseAlert(target, type, value) {
  const existing = await Alert.findOne({
    where: {
      target_id: target.id,
      type,
      resolved: false
    }
  });

  if (existing) return;

  await Alert.create({
    user_id: target.user_id,
    target_id: target.id,
    type,
    message: `${type} alert – value: ${value}`,
    sent_via: 'pending'
  });

  const alertsQ = new Queue('alerts', { connection: redis });
 
  await alertsQ.add('notify', {
  target: {
    id: target.id,
    label: target.label,
    url: target.url,
    ownerEmail: target.User?.email || 'fallback@example.com'
  },
  type,
  value
});

}

// ✅ Schedule HTTP checks every 5 minutes
setInterval(async () => {
  const targets = await getActiveTargets();
  for (const t of targets) {
    await checksQ.add('http', { target: t });
  }
}, 5 * 60 * 1000);

// ✅ Schedule SSL/WHOIS once a day at midnight
function scheduleDaily() {
  getActiveTargets().then(tgts =>
    tgts.forEach(t => sslQ.add('cert', { target: t }))
  );
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

// ✅ Worker for HTTP check
new Worker('checks', async job => {
  const { target } = job.data;
  const start = Date.now();
  try {
    const r = await fetch(target.url, { redirect: 'manual', timeout: 10000 });
    await saveHttpResult(target.id, r.status, Date.now() - start);
    if (await isFlapping(target.id)) await raiseAlert(target, 'DOWN', r.status);
  } catch (e) {
    console.error(`❌ Fetch failed for ${target.url}:`, e.message);
    await saveHttpResult(target.id, 0, -1);
    if (await isFlapping(target.id)) await raiseAlert(target, 'DOWN', 0);
    throw e;
  }
}, { connection: redis, backoff: { type: 'exponential', delay: 30000 } });

// ✅ Worker for SSL + Domain
new Worker('ssl', async job => {
  const { target } = job.data;
  const { daysCert, daysDomain } = await probeExpiry(target.url);
  console.log(`✅ SSL for ${target.url} – Cert: ${daysCert}d, Domain: ${daysDomain}d`);
  await saveExpiry(target.id, daysCert, daysDomain);
  if (daysCert <= 14) await raiseAlert(target, 'SSL', daysCert);
  if (daysDomain !== -1 && daysDomain <= 14) await raiseAlert(target, 'DOMAIN', daysDomain);
}, { connection: redis });

console.log('Worker online – monitoring every 5 min');
scheduleDaily(); // 👈 Run SSL/Domain check immediately
