import { z } from 'zod';
import { Notification, Announcement, Student, Fee, Payment } from '../models/index.js';
import { mailAdmin, esc } from '../services/mailService.js';
import { notify } from '../services/notificationService.js';
export const notifications = {
  async list(req, res) { res.json(await Notification.find({ student: req.user.id }).sort({ createdAt: -1 }).limit(100)); },
  async markAllRead(req, res) { await Notification.updateMany({ student: req.user.id, read: false }, { read: true }); res.json({ ok: true }); },
  async markRead(req, res) { await Notification.updateOne({ _id: req.params.id, student: req.user.id }, { read: true }); res.json({ ok: true }); },
  async sendCustom(req, res) { // by mobile number (parent or student) or explicit ids
    const d = z.object({ mobile: z.string().regex(/^\d{10}$/).optional(), studentIds: z.array(z.string()).optional(), title: z.string().min(1), message: z.string().min(1), type: z.string().default('IMPORTANT') }).parse(req.body);
    let ids = d.studentIds || [];
    if (d.mobile) ids = (await Student.find({ $or: [{ mobile: d.mobile }, { parentMobile: d.mobile }], status: 'ACTIVE' }).select('_id')).map((s) => s._id);
    if (!ids.length) return res.status(404).json({ message: 'No student found with this mobile number' });
    for (const id of ids) await notify(id, d.type, d);
    res.json({ sent: ids.length });
  },
};
export const announcements = {
  async list(req, res) { res.json(await Announcement.find().sort({ createdAt: -1 }).limit(100)); },
  async create(req, res) {
    const d = z.object({ title: z.string().min(2), message: z.string().min(2), priority: z.enum(['NORMAL', 'IMPORTANT']).default('NORMAL'),
      audience: z.object({ type: z.enum(['ALL', 'CLASS', 'BATCH', 'SELECTED']), value: z.string().optional(), studentIds: z.array(z.string()).optional() }) }).parse(req.body);
    const a = await Announcement.create(d);
    const f = { status: 'ACTIVE' };
    if (d.audience.type === 'CLASS') f.className = d.audience.value;
    if (d.audience.type === 'BATCH') f.batch = d.audience.value;
    if (d.audience.type === 'SELECTED') f._id = { $in: d.audience.studentIds };
    const targets = await Student.find(f).select('_id');
    for (const s of targets) await notify(s._id, d.audience.type === 'ALL' ? 'ANNOUNCEMENT' : 'CLASS_ANNOUNCEMENT', d);
    mailAdmin(`📢 Announcement sent: ${d.title}`, `<h2>${esc(d.title)}</h2><p>${esc(d.message)}</p><p>Sent to ${targets.length} students (${d.audience.type}).</p>`);
    res.status(201).json({ announcement: a, notified: targets.length });
  },
};
export async function monthlyReport(req, res) {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  const start = new Date(`${month}-01`); const end = new Date(start); end.setMonth(end.getMonth() + 1);
  const [fees, collected, students, byClass] = await Promise.all([
    Fee.aggregate([{ $match: { month } }, { $group: { _id: '$status', count: { $sum: 1 }, pending: { $sum: { $subtract: ['$amount', '$paidAmount'] } } } }]),
    Payment.aggregate([{ $match: { paidOn: { $gte: start, $lt: end } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Student.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Student.aggregate([{ $match: { status: 'ACTIVE' } }, { $group: { _id: '$className', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
  ]);
  res.json({ month, fees, collection: collected[0]?.total || 0, students, byClass });
}
export async function paymentsReport(req, res) {
  const { from, to, className } = req.query; const f = {};
  if (from || to) { f.paidOn = {}; if (from) f.paidOn.$gte = new Date(from); if (to) { const e = new Date(to); e.setDate(e.getDate() + 1); f.paidOn.$lt = e; } }
  let list = await Payment.find(f).populate('student', 'fullName studentId className batch').populate('fee', 'month').sort({ paidOn: -1 }).limit(2000);
  if (className) list = list.filter((p) => p.student?.className === className);
  res.json(list);
}
