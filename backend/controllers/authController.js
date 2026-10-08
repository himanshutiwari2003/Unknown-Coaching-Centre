import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User, Student } from '../models/index.js';
import { signToken } from '../middleware/auth.js';
const schema = z.object({ identifier: z.string().min(3), password: z.string().min(6) });
export async function login(req, res) {
  const { identifier, password } = schema.parse(req.body);
  let account = null, role = 'student';
  if (identifier.includes('@')) {
    role = 'admin';
    account = await User.findOne({ email: identifier.toLowerCase() }).select('+passwordHash');
    if (account && !(await bcrypt.compare(password, account.passwordHash))) account = null;
  } else {
    // Student ID, or mobile number (siblings may share a parent mobile, so the password picks the right child)
    const q = /^\d{10}$/.test(identifier) ? { $or: [{ mobile: identifier }, { parentMobile: identifier }] } : { studentId: identifier.toUpperCase() };
    for (const s of await Student.find({ ...q, status: 'ACTIVE' }).select('+passwordHash')) {
      if (await bcrypt.compare(password, s.passwordHash)) { account = s; break; }
    }
  }
  if (!account) return res.status(401).json({ message: 'Incorrect ID or password' });
  const user = { id: account._id, role, name: account.name || account.fullName, studentId: account.studentId };
  res.json({ token: signToken(user), user });
}
export async function saveFcmToken(req, res) {
  const { token } = z.object({ token: z.string().min(20) }).parse(req.body);
  await Student.updateOne({ _id: req.user.id }, { $addToSet: { fcmTokens: token } });
  res.json({ ok: true });
}
export async function changePassword(req, res) {
  const { current, next } = z.object({ current: z.string(), next: z.string().min(6).max(64) }).parse(req.body);
  const acc = await (req.user.role === 'admin' ? User : Student).findById(req.user.id).select('+passwordHash');
  if (!acc || !(await bcrypt.compare(current, acc.passwordHash))) return res.status(400).json({ message: 'Current password is incorrect' });
  acc.passwordHash = await bcrypt.hash(next, 10); await acc.save();
  res.json({ ok: true });
}
