import { Fee, Payment, Student } from '../models/index.js';
import { mailAdmin, esc } from './mailService.js';
const REPORT_HOUR = 20; // 8 PM server time. Set TZ=Asia/Kolkata on the host.
let lastSent = '';
export async function sendDailyReport() {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const month = new Date().toISOString().slice(0, 7);
  const [pays, fees] = await Promise.all([
    Payment.find({ paidOn: { $gte: start } }).populate('student', 'fullName className'),
    Fee.find({ month, status: { $ne: 'PAID' } }).populate('student', 'fullName className parentMobile'),
  ]);
  const total = pays.reduce((t, p) => t + p.amount, 0);
  const pending = fees.reduce((t, f) => t + (f.amount - f.paidAmount), 0);
  const csv = ['Student,Class,Parent mobile,Pending,Due date', ...fees.map((f) => `"${f.student?.fullName}",${f.student?.className},${f.student?.parentMobile},${f.amount - f.paidAmount},${f.dueDate.toISOString().slice(0, 10)}`)].join('\n');
  await mailAdmin(`📊 Daily report: ₹${total} collected, ${fees.length} pending`,
    `<h2>Today</h2><p>Collected: <b>₹${total}</b> from ${pays.length} payments</p><ul>${pays.map((p) => `<li>${esc(p.student?.fullName)}: ₹${p.amount} (${p.method})</li>`).join('') || '<li>No payments today</li>'}</ul><h2>Pending this month</h2><p><b>${fees.length}</b> students · ₹${pending}. Full list attached.</p>`,
    [{ filename: `pending-fees-${month}.csv`, content: csv }]);
}
/** Checks once a minute; sends one report per day. No extra cron package needed. */
export function startDailyReport() {
  setInterval(() => {
    const now = new Date(), key = now.toDateString();
    if (now.getHours() === REPORT_HOUR && lastSent !== key) { lastSent = key; sendDailyReport().catch((e) => console.error(e.message)); }
  }, 60 * 1000);
}
