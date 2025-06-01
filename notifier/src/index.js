const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const redis = new IORedis('redis://redis:6379');

const alertQ = new Queue('alerts', { connection: redis });

const mail = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
});

new Worker('alerts', async job => {
  const { target, type, value } = job.data;

  /* Slack */
  await fetch(process.env.SLACK_WEBHOOK, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text: `🚨 ${type} alert for ${target.url}: ${value}` })
  });

  /* E-mail */
  await mail.sendMail({
    from: process.env.MAIL_FROM,
    to: target.ownerEmail,
    subject: `[Mini-Netumo] ${type} alert for ${target.label}`,
    text: `${target.url} → ${type} = ${value}`
  });
}, { connection: redis });
