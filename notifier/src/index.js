require('dotenv').config(); // Load environment variables

const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const nodemailer = require('nodemailer');

// Fixed fetch: works with dynamic import in Node.js
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Redis connection (BullMQ-compatible)
const redis = new IORedis('redis://redis:6379', {
  maxRetriesPerRequest: null
});

// Mail configuration
const mail = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// Alert processing worker
new Worker('alerts', async job => {
  const { target, type, value } = job.data;

  console.log(`🔔 Processing ${type} alert for ${target.url} with value ${value}`);

  // Optional: Slack alert
  // if (process.env.SLACK_WEBHOOK?.startsWith("https://")) {
  //   try {
  //     await fetch(process.env.SLACK_WEBHOOK, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         text: `🚨 ${type} alert for ${target.url} — value: ${value}`
  //       })
  //     });
  //   } catch (err) {
  //     console.error('❌ Slack notification failed:', err.message);
  //   }
  // }

  // Email alert
  try {
    await mail.sendMail({
      from: process.env.MAIL_FROM,
      to: target.ownerEmail,
      subject: `Mini-Netumo ${type} alert for ${target.label}`,
      text: `${target.url} → ${type} = ${value}`
    });
  } catch (err) {
    console.error('❌ Email notification failed:', err.message);
  }

}, {
  connection: redis,
  concurrency: 5
});
