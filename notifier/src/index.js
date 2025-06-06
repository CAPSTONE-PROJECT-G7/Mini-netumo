require('dotenv').config(); // ✅ Load environment variables

const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');

// ✅ Redis connection (BullMQ compatibility)
const redis = new IORedis('redis://redis:6379', {
  maxRetriesPerRequest: null
});

// ✅ Job queue
const alertQ = new Queue('alerts', { connection: redis });

// ✅ Define a sample job
const target = {
  url: "https://www.sombyo.co.tz",
  label: "Sombyo Example",
  ownerEmail: "jacksonmayay@gmail.com"
};
const daysCert = 15;
const statusCode = 503;

// ✅ Trigger the job once
async function main() {
  const value = daysCert || statusCode;
  await alertQ.add('email', {
    target,
    type: 'DOWN',
    value
  });
}
main().catch(console.error);

// ✅ Mail configuration
const mail = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// ✅ Worker: handle the job queue
new Worker('alerts', async job => {
  const { target, type, value } = job.data;

  console.log(`🔔 Processing ${type} alert for ${target.url} with value ${value}`);

  // ✅ Slack alert (skip if webhook not set)
  if (process.env.SLACK_WEBHOOK && process.env.SLACK_WEBHOOK.startsWith("https://")) {
    await fetch(process.env.SLACK_WEBHOOK, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 ${type} alert for ${target.url}: ${value}`
      })
    });
  }

  // ✅ Email alert
  await mail.sendMail({
    from: process.env.MAIL_FROM,
    to: target.ownerEmail,
    subject: `[Mini-Netumo] ${type} alert for ${target.label}`,
    text: `${target.url} → ${type} = ${value}`
  });

}, { connection: redis });
