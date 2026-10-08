import { z } from 'zod';
import { Fee, Payment, Student } from '../models/index.js';
import { emitToAdmins, emitToStudent } from '../services/socket.js';
import { mailAdmin, row } from '../services/mailService.js';
import { getSettings } from './settingsController.js';
import { notify, templates, reminderText } from '../services/notificationService.js';

export async function list(req, res) {
  const filter = {};
  if (req.user.role === 'student') filter.student = req.user.id;
  else if (req.query.student) filter.student = req.query.student;
  if (req.query.month) filter.month = req.query.month;
  const fees = await Fee.find(filter).populate('student', 'fullName studentId className batch parentMobile').sort({ dueDate: -1 });
  fees.forEach((f) => { if (f.status !== 'PAID') f.recompute(); }); // keep OVERDUE accurate without a cron
  const { status } = req.query;
  res.json(status ? fees.filter((f) => f.status === status) : fees);
}
/** Creates the month's fee record for every active student that does not have one yet. */
export async function generateMonth(req, res) {
  const month = z.string().regex(/^\d{4}-\d{2}$/).parse(req.body.month);
  const students = await Student.find({ status: 'ACTIVE' });
  let created = 0;
  for (const s of students) {
    const [y, m] = month.split('-').map(Number);
    const r = await Fee.updateOne({ student: s._id, month }, { $setOnInsert: { amount: s.monthlyFee, dueDate: new Date(y, m - 1, s.dueDay) } }, { upsert: true });
    created += r.upsertedCount;
  }
  res.status(201).json({ created });
}
export async function update(req, res) {
  const data = z.object({ amount: z.number().min(0).optional(), dueDate: z.string().optional(), notes: z.string().optional() }).parse(req.body);
  const fee = await Fee.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!fee) return res.status(404).json({ message: 'Fee not found' });
  fee.recompute(); await fee.save(); res.json(fee);
}
export async function remind(req, res) {
  const fee = await Fee.findById(req.params.id);
  if (!fee || fee.status === 'PAID') return res.status(400).json({ message: 'Nothing to remind for this fee' });
  const tpl = (await getSettings()).reminderTemplate;
  await notify(fee.student, 'FEE_REMINDER', { title: '🔔 Fee Reminder', message: reminderText(tpl, fee) });
  fee.lastReminderAt = new Date(); await fee.save();
  res.json({ ok: true });
}
export async function remindAll(req, res) {
  const fees = await Fee.find({ status: { $in: ['PENDING', 'PARTIAL', 'OVERDUE'] }, ...(req.body.feeIds?.length ? { _id: { $in: req.body.feeIds } } : {}) });
  const tpl = (await getSettings()).reminderTemplate;
  for (const f of fees) { await notify(f.student, 'FEE_REMINDER', { title: '🔔 Fee Reminder', message: reminderText(tpl, f) }); f.lastReminderAt = new Date(); await f.save(); }
  mailAdmin(`🔔 Reminders sent to ${fees.length} students`, `<p>Fee reminders were sent to <b>${fees.length}</b> students with pending fees.</p>`);
  res.json({ sent: fees.length });
}
export const payments = {
  async list(req, res) {
    const filter = req.user.role === 'student' ? { student: req.user.id } : req.query.student ? { student: req.query.student } : {};
    res.json(await Payment.find(filter).populate('student', 'fullName studentId className batch').populate('fee', 'month').sort({ paidOn: -1 }).limit(500));
  },
  async create(req, res) {
    const d = z.object({ fee: z.string(), amount: z.number().min(1), method: z.enum(['CASH', 'UPI', 'BANK', 'OTHER']), transactionId: z.string().optional(), paidOn: z.string().optional() }).parse(req.body);
    const fee = await Fee.findById(d.fee);
    if (!fee) return res.status(404).json({ message: 'Fee not found' });
    if (d.amount > fee.amount - fee.paidAmount) return res.status(400).json({ message: 'Amount is more than the pending fee' });
    const receiptNo = `RCT-${Date.now().toString(36).toUpperCase()}`;
    const payment = await Payment.create({ ...d, student: fee.student, receiptNo, recordedBy: req.user.id });
    fee.paidAmount += d.amount; fee.recompute(); await fee.save();
    emitToAdmins('fee:updated', { feeId: fee._id }); emitToStudent(fee.student, 'fee:updated', { feeId: fee._id });
    const stu = await Student.findById(fee.student);
    mailAdmin(`💰 ₹${d.amount} received: ${stu.fullName}`, `<h2>Payment recorded</h2><table>${row('Student', stu.fullName + ' (' + stu.studentId + ')')}${row('Class', stu.className)}${row('Month', fee.month)}${row('Amount', '₹' + d.amount)}${row('Method', d.method)}${row('Transaction ID', d.transactionId || '-')}${row('Receipt', receiptNo)}${row('Still pending', '₹' + (fee.amount - fee.paidAmount))}</table>`);
    await notify(fee.student, 'PAYMENT_SUCCESS', templates.PAYMENT_SUCCESS(null, fee, payment));
    res.status(201).json({ payment, fee });
  },
};
