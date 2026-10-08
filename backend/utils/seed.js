// First admin (from env) + optional demo students: `npm run seed` or `npm run seed -- --demo`
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { User, Student, Fee } from '../models/index.js';
await connectDB();
const { SEED_ADMIN_EMAIL: email, SEED_ADMIN_PASSWORD: pw } = process.env;
if (!email || !pw || pw.length < 8) throw new Error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (8+ chars) in .env');
await User.updateOne({ email }, { $setOnInsert: { name: 'Admin', email, passwordHash: await bcrypt.hash(pw, 12) } }, { upsert: true });
console.log('Admin ready:', email);
if (process.argv.includes('--demo')) {
  const names = ['Aarav Sharma', 'Diya Verma', 'Rohan Patel', 'Ananya Singh', 'Karan Yadav', 'Priya Gupta', 'Aditya Mishra', 'Sneha Joshi', 'Vivaan Dubey', 'Isha Tiwari'];
  const hash = await bcrypt.hash('Demo@1234', 10); // demo only: delete before going live
  const now = new Date(); const month = now.toISOString().slice(0, 7);
  for (const [i, fullName] of names.entries()) {
    const s = await Student.create({ studentId: `UCC-2026-${String(i + 1).padStart(4, '0')}`, passwordHash: hash, fullName, className: `Class ${6 + (i % 5)}`, batch: i % 2 ? 'Evening' : 'Morning', mobile: `98765000${String(i).padStart(2, '0')}`, parentMobile: `91234000${String(i).padStart(2, '0')}`, monthlyFee: 500 + (i % 3) * 100, dueDay: 10 });
    const amount = s.monthlyFee; const paid = [amount, 0, amount / 2, 0][i % 4];
    const f = new Fee({ student: s._id, month, amount, paidAmount: paid, dueDate: new Date(now.getFullYear(), now.getMonth(), i % 4 === 3 ? 1 : 25) });
    f.recompute(); await f.save();
  }
  console.log('Demo students added (password Demo@1234)');
}
await mongoose.disconnect();
