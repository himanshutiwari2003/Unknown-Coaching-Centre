import admin from 'firebase-admin';
import { Notification, Student } from '../models/index.js';
import { emitToStudent } from './socket.js';
let ready = false;
function init() {
  if (ready || !process.env.FIREBASE_PROJECT_ID) return ready;
  admin.initializeApp({ credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n') }) });
  return (ready = true);
}
export const reminderText = (tpl, fee) => tpl.replaceAll('{amount}', fee.amount - fee.paidAmount).replaceAll('{month}', fee.month);
export const templates = {
  FEE_REMINDER: (s, fee) => ({ title: '🔔 Fee Reminder', message: `Dear Parent/Student, your monthly fee of ₹${fee.amount - fee.paidAmount} for ${fee.month} is pending. Please pay before the due date.\n\nUnknown Coaching Centre` }),
  PAYMENT_SUCCESS: (s, fee, p) => ({ title: '✅ Payment received', message: `₹${p.amount} received for ${fee.month}. Receipt ${p.receiptNo}. Thank you!` }),
};
/** Saves an in-app notification and pushes to the student's devices when FCM is configured. */
export async function notify(studentId, type, { title, message }) {
  const note = await Notification.create({ student: studentId, type, title, message });
  emitToStudent(studentId, 'notification', note); // instant in-app delivery
  if (init()) {
    const s = await Student.findById(studentId).select('+fcmTokens');
    if (s?.fcmTokens?.length) {
      const r = await admin.messaging().sendEachForMulticast({ tokens: s.fcmTokens, notification: { title, body: message } });
      const bad = s.fcmTokens.filter((_, i) => !r.responses[i].success);
      if (bad.length) await Student.updateOne({ _id: s._id }, { $pull: { fcmTokens: { $in: bad } } });
    }
  }
  return note;
}
