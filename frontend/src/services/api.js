import * as demo from './demoData.js';
import { emitDemo } from './realtime.js';
const BASE = import.meta.env.VITE_API_URL || ''; // empty = same server as the website
export const isDemo = import.meta.env.VITE_DEMO === 'true';
const delay = (v) => new Promise((r) => setTimeout(() => r(structuredClone(v)), 250));

async function http(path, opts = {}) {
  const token = localStorage.getItem('ucc_token');
  const res = await fetch(`${BASE}/api${path}`, { ...opts, headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) }, body: opts.body && JSON.stringify(opts.body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong. Please try again.'); // friendly messages only
  return data;
}
let fees = structuredClone(demo.fees); let students = structuredClone(demo.students);
let notes = structuredClone(demo.notifications); let pays = structuredClone(demo.payments); const anns = demo.announcements;
const MY = 's1';
function demoNote(f, type, title, message) { // mimics the server pushing a notification to the student
  if (f.student._id !== MY) return;
  const n = { _id: 'n' + Math.random(), type, title, message, read: false, createdAt: new Date().toISOString() };
  notes = [n, ...notes]; emitDemo('notification', n);
}
let demoSettings = { instituteName: 'Unknown Coaching Centre', phone: '', email: 'unknowncoachingcentre@gmail.com', address: '', defaultFee: 500, defaultDueDay: 10, session: '2026-27', reminderTemplate: 'Dear Parent/Student, your monthly fee of ₹{amount} for {month} is pending. Please complete the payment before the due date.\n\nUnknown Coaching Centre' };
const sum = (a, k) => a.reduce((t, x) => t + x[k], 0);

export const api = {
  login: (identifier, password) => isDemo
    ? delay(identifier.includes('@') ? { token: 'demo', user: { role: 'admin', name: 'Admin' } } : { token: 'demo', user: { role: 'student', name: 'Diya Verma', studentId: 'UCC-2026-0002' } })
    : http('/auth/login', { method: 'POST', body: { identifier, password } }),
  students: () => isDemo ? delay(students) : http('/students'),
  addStudent: (d) => isDemo ? delay((students = [{ ...d, _id: `s${students.length}`, studentId: `UCC-2026-${String(students.length + 1).padStart(4, '0')}`, status: 'ACTIVE' }, ...students], { tempPassword: 'demo1234' })) : http('/students', { method: 'POST', body: d }),
  fees: (month) => isDemo ? delay(fees) : http('/fees' + (month ? `?month=${month}` : '')),
  pay: ({ fee, amount, method, transactionId }) => {
    if (!isDemo) return http('/payments', { method: 'POST', body: { fee, amount, method, transactionId } });
    fees = fees.map((f) => { if (f._id !== fee) return f; const paidAmount = f.paidAmount + amount; return { ...f, paidAmount, pendingAmount: f.amount - paidAmount, status: paidAmount >= f.amount ? 'PAID' : 'PARTIAL' }; });
    const ff = fees.find((x) => x._id === fee);
    const payment = { _id: 'p' + Date.now(), receiptNo: 'RCT-' + Date.now().toString(36).toUpperCase(), amount, method, transactionId, paidOn: new Date().toISOString(), student: ff.student, fee: { month: ff.month } };
    if (ff.student._id === MY) pays = [payment, ...pays];
    demoNote(ff, 'PAYMENT_SUCCESS', '✅ Payment received', `₹${amount} received for ${ff.month}. Receipt ${payment.receiptNo}. Thank you!`);
    emitDemo('fee:updated', { feeId: fee });
    return delay({ payment });
  },
  remind: (id) => { if (!isDemo) return http(`/fees/${id}/remind`, { method: 'POST' }); const f = fees.find((x) => x._id === id); demoNote(f, 'FEE_REMINDER', '🔔 Fee Reminder', `Dear Parent/Student, your monthly fee of ₹${f.pendingAmount} for ${f.month} is pending. Please pay before the due date.`); return delay({ ok: true }); },
  remindAll: () => { if (!isDemo) return http('/fees/remind-all', { method: 'POST', body: {} }); const l = fees.filter((f) => f.status !== 'PAID'); l.forEach((f) => demoNote(f, 'FEE_REMINDER', '🔔 Fee Reminder', `Dear Parent/Student, your monthly fee of ₹${f.pendingAmount} for ${f.month} is pending.`)); return delay({ sent: l.length }); },
  updateStudent: (id, d) => isDemo ? delay((students = students.map((s) => s._id === id ? { ...s, ...d } : s), { ok: true })) : http(`/students/${id}`, { method: 'PUT', body: d }),
  deactivate: (id) => isDemo ? delay((students = students.filter((s) => s._id !== id), { ok: true })) : http(`/students/${id}`, { method: 'DELETE' }),
  createAnnouncement: (d) => isDemo ? delay({ notified: students.length }) : http('/announcements', { method: 'POST', body: d }),
  sendByMobile: async (mobile, title, message) => { if (!isDemo) return http('/notifications', { method: 'POST', body: { mobile, title, message } }); if (!students.some((s) => s.parentMobile === mobile || s.mobile === mobile)) throw new Error('No student found with this mobile number'); return delay({ sent: 1 }); },
  settings: () => isDemo ? delay(demoSettings) : http('/settings'),
  saveSettings: (d) => isDemo ? delay((demoSettings = d)) : http('/settings', { method: 'PUT', body: d }),
  paymentsReport: (from, to) => isDemo ? delay(pays) : http(`/reports/payments?from=${from}&to=${to}`),
  me: () => isDemo ? delay(students[1]) : http('/students/me'),
  updateMe: (d) => isDemo ? delay((students = students.map((s) => s._id === MY ? { ...s, ...d } : s), { ok: true })) : http('/students/me', { method: 'PUT', body: d }),
  changePassword: (current, next) => isDemo ? delay({ ok: true }) : http('/auth/change-password', { method: 'POST', body: { current, next } }),
  generateMonth: () => isDemo ? delay({ created: 0 }) : http('/fees/generate', { method: 'POST', body: { month: new Date().toISOString().slice(0, 7) } }),
  notifications: () => isDemo ? delay(notes) : http('/notifications'),
  markAllRead: () => { if (isDemo) { notes = notes.map((n) => ({ ...n, read: true })); return delay({ ok: true }); } return http('/notifications/read-all', { method: 'PUT' }); },
  payments: () => isDemo ? delay(pays) : http('/payments'),
  announcements: () => isDemo ? delay(anns) : http('/announcements'),
  myFees: () => isDemo ? delay(fees.filter((f) => f.student._id === MY).concat([{ _id: 'h1', month: '2026-09', amount: 600, paidAmount: 600, pendingAmount: 0, status: 'PAID', dueDate: '2026-09-10', student: demo.students[1] }])) : http('/fees'),
  stats: async () => {
    if (!isDemo) {
      const [r, s, f] = await Promise.all([http('/reports/monthly'), http('/students'), http('/fees')]);
      const pend = f.filter((x) => x.status !== 'PAID');
      return { total: s.length, active: s.filter((x) => x.status === 'ACTIVE').length, paid: f.length - pend.length, pending: pend.length, collection: r.collection, pendingAmount: sum(pend, 'pendingAmount'), trend: [{ month: r.month, collected: r.collection }], byClass: r.byClass.map((c) => ({ name: c._id, count: c.count })) };
    }
    return delay({ total: students.length, active: students.length, paid: fees.filter((f) => f.status === 'PAID').length, pending: fees.filter((f) => f.status !== 'PAID').length, collection: sum(fees, 'paidAmount'), pendingAmount: sum(fees, 'pendingAmount'),
      trend: demo.trend, byClass: [6, 7, 8, 9, 10].map((c) => ({ name: `Class ${c}`, count: students.filter((s) => s.className === `Class ${c}`).length })) });
  },
};
