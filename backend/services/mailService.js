import nodemailer from 'nodemailer';
export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let tx;
function transport() {
  if (tx) return tx;
  const { GMAIL_USER: user, GMAIL_APP_PASSWORD: pass } = process.env;
  if (!user || !pass) return null; // email is optional: app works without it
  return (tx = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } }));
}
/** Sends an update to the institute inbox. Never throws, so a mail problem can never block a payment or admission. */
export async function mailAdmin(subject, html, attachments = []) {
  const t = transport();
  if (!t) return false;
  try {
    await t.sendMail({ from: `"Unknown Coaching Centre" <${process.env.GMAIL_USER}>`, to: process.env.ADMIN_NOTIFY_EMAIL || process.env.GMAIL_USER, subject, html: `<div style="font-family:Arial,sans-serif;max-width:560px">${html}<hr><small>Unknown Coaching Centre · automatic update</small></div>`, attachments });
    return true;
  } catch (e) { console.error('Update email failed:', e.message); return false; }
}
export const row = (k, v) => `<tr><td style="padding:4px 12px 4px 0;color:#64748b">${esc(k)}</td><td><b>${esc(v)}</b></td></tr>`;
