import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const opts = { timestamps: true };

export const User = model('User', new Schema({
  name: String, email: { type: String, unique: true, required: true, lowercase: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin'], default: 'admin' },
}, opts));

export const Student = model('Student', new Schema({
  studentId: { type: String, unique: true, index: true },
  passwordHash: { type: String, required: true, select: false }, // never returned by API
  fullName: { type: String, required: true, trim: true },
  fatherName: String, motherName: String,
  mobile: { type: String, index: true }, parentMobile: String, email: String,
  dob: Date, address: String,
  className: { type: String, required: true, index: true },
  batch: { type: String, index: true }, course: String,
  admissionDate: { type: Date, default: Date.now },
  monthlyFee: { type: Number, required: true, min: 0 },
  dueDay: { type: Number, default: 10, min: 1, max: 28 },
  photoUrl: String,
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  fcmTokens: { type: [String], select: false, default: [] },
}, opts));

const feeSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  month: { type: String, required: true }, // "2026-10"
  amount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['PAID', 'PARTIAL', 'PENDING', 'OVERDUE'], default: 'PENDING' },
  notes: String, lastReminderAt: Date,
}, opts);
feeSchema.index({ student: 1, month: 1 }, { unique: true });
feeSchema.virtual('pendingAmount').get(function () { return Math.max(this.amount - this.paidAmount, 0); });
feeSchema.set('toJSON', { virtuals: true });
feeSchema.methods.recompute = function () {
  if (this.paidAmount >= this.amount) this.status = 'PAID';
  else if (this.paidAmount > 0) this.status = 'PARTIAL';
  else this.status = 'PENDING';
  if (this.status !== 'PAID' && this.dueDate < new Date()) this.status = this.paidAmount > 0 ? 'PARTIAL' : 'OVERDUE';
};
export const Fee = model('Fee', feeSchema);

export const Payment = model('Payment', new Schema({
  fee: { type: Schema.Types.ObjectId, ref: 'Fee', required: true, index: true },
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  receiptNo: { type: String, unique: true },
  amount: { type: Number, required: true, min: 1 },
  method: { type: String, enum: ['CASH', 'UPI', 'BANK', 'OTHER'], default: 'CASH' },
  transactionId: String, paidOn: { type: Date, default: Date.now },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, opts));

export const Notification = model('Notification', new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', index: true },
  type: { type: String, enum: ['FEE_REMINDER', 'PAYMENT_SUCCESS', 'PAYMENT_PENDING', 'RECEIPT', 'ANNOUNCEMENT', 'CLASS_ANNOUNCEMENT', 'IMPORTANT'], required: true },
  title: String, message: String, read: { type: Boolean, default: false },
}, opts));

export const Announcement = model('Announcement', new Schema({
  title: { type: String, required: true }, message: { type: String, required: true },
  audience: { type: { type: String, enum: ['ALL', 'CLASS', 'BATCH', 'SELECTED'], default: 'ALL' }, value: String, studentIds: [{ type: Schema.Types.ObjectId, ref: 'Student' }] },
  priority: { type: String, enum: ['NORMAL', 'IMPORTANT'], default: 'NORMAL' },
}, opts));

export const Settings = model('Settings', new Schema({
  key: { type: String, default: 'main', unique: true },
  instituteName: { type: String, default: 'Unknown Coaching Centre' }, phone: String, email: String, address: String,
  defaultFee: { type: Number, default: 500 }, defaultDueDay: { type: Number, default: 10 }, session: { type: String, default: '2026-27' },
  reminderTemplate: { type: String, default: 'Dear Parent/Student, your monthly fee of ₹{amount} for {month} is pending. Please complete the payment before the due date.\n\nUnknown Coaching Centre' },
}, opts));
