import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { Student } from '../models/index.js';
import { mailAdmin, row } from '../services/mailService.js';
const body = z.object({
  fullName: z.string().min(2), fatherName: z.string().optional(), motherName: z.string().optional(),
  mobile: z.string().regex(/^\d{10}$/).optional(), parentMobile: z.string().regex(/^\d{10}$/),
  email: z.string().email().optional().or(z.literal('')), dob: z.string().optional(), address: z.string().optional(),
  className: z.string(), batch: z.string().optional(), course: z.string().optional(),
  monthlyFee: z.coerce.number().min(0), dueDay: z.coerce.number().min(1).max(28).default(10),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(), photoUrl: z.string().max(200000).optional(),
});
async function nextStudentId() {
  const year = new Date().getFullYear();
  const count = await Student.countDocuments({ studentId: new RegExp(`^UCC-${year}-`) });
  return `UCC-${year}-${String(count + 1).padStart(4, '0')}`;
}
export async function list(req, res) {
  const { q, className, batch, status } = req.query;
  const filter = {};
  if (className) filter.className = className;
  if (batch) filter.batch = batch;
  if (status) filter.status = status;
  if (q) { const r = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); filter.$or = [{ fullName: r }, { studentId: r }, { mobile: r }, { parentMobile: r }]; }
  res.json(await Student.find(filter).sort({ createdAt: -1 }).limit(500));
}
export async function create(req, res) {
  const data = body.parse(req.body);
  const tempPassword = crypto.randomBytes(4).toString('hex'); // shown ONCE to admin; only the hash is stored
  const student = await Student.create({ ...data, studentId: await nextStudentId(), passwordHash: await bcrypt.hash(tempPassword, 10) });
  mailAdmin(`🎓 New student: ${student.fullName}`, `<h2>New admission</h2><table>${row('Name', student.fullName)}${row('Student ID', student.studentId)}${row('Class', student.className)}${row('Parent mobile', student.parentMobile)}${row('Monthly fee', '₹' + student.monthlyFee)}</table>`); // password is never emailed
  res.status(201).json({ student, tempPassword });
}
export async function getOne(req, res) {
  const id = req.user.role === 'student' ? req.user.id : req.params.id;
  const s = await Student.findById(id);
  s ? res.json(s) : res.status(404).json({ message: 'Student not found' });
}
export async function update(req, res) {
  const s = await Student.findByIdAndUpdate(req.params.id, body.partial().parse(req.body), { new: true, runValidators: true });
  s ? res.json(s) : res.status(404).json({ message: 'Student not found' });
}
export async function deactivate(req, res) { // soft delete keeps fee history intact
  await Student.findByIdAndUpdate(req.params.id, { status: 'INACTIVE' });
  res.json({ ok: true });
}
export async function resetPassword(req, res) {
  const tempPassword = crypto.randomBytes(4).toString('hex');
  await Student.findByIdAndUpdate(req.params.id, { passwordHash: await bcrypt.hash(tempPassword, 10) });
  res.json({ tempPassword });
}
export async function updateMe(req, res) { // students edit only basic details
  const d = z.object({ email: z.string().email().optional().or(z.literal('')), address: z.string().max(300).optional(), mobile: z.string().regex(/^\d{10}$/).optional(), photoUrl: z.string().max(200000).optional() }).parse(req.body);
  res.json(await Student.findByIdAndUpdate(req.user.id, d, { new: true }));
}
