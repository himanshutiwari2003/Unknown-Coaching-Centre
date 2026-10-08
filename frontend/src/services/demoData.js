// DEMO / MOCK DATA ONLY: used when VITE_API_URL is empty. Never touches the real database.
const names = ['Aarav Sharma', 'Diya Verma', 'Rohan Patel', 'Ananya Singh', 'Karan Yadav', 'Priya Gupta', 'Aditya Mishra', 'Sneha Joshi', 'Vivaan Dubey', 'Isha Tiwari'];
const statuses = ['PAID', 'PENDING', 'PARTIAL', 'OVERDUE'];
export const students = names.map((fullName, i) => ({ _id: `s${i}`, studentId: `UCC-2026-${String(i + 1).padStart(4, '0')}`, fullName, className: `Class ${6 + (i % 5)}`, batch: i % 2 ? 'Evening' : 'Morning', mobile: `98765000${String(i).padStart(2, '0')}`, parentMobile: `91234000${String(i).padStart(2, '0')}`, monthlyFee: 500 + (i % 3) * 100, status: 'ACTIVE' }));
export const fees = students.map((s, i) => { const status = statuses[i % 4]; const paidAmount = status === 'PAID' ? s.monthlyFee : status === 'PARTIAL' ? s.monthlyFee / 2 : 0;
  return { _id: `f${i}`, student: s, month: '2026-10', amount: s.monthlyFee, paidAmount, pendingAmount: s.monthlyFee - paidAmount, status, dueDate: `2026-10-${status === 'OVERDUE' ? '01' : '25'}` }; });
export const trend = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map((m, i) => ({ month: m, collected: 3200 + i * 450 + (i % 2) * 300 }));

// Demo student account = students[1] (Diya Verma, fee pending)
const ago = (d) => new Date(Date.now() - d * 864e5).toISOString();
export const notifications = [
  { _id: 'n1', type: 'ANNOUNCEMENT', title: '📢 Important Notice', message: "Tomorrow's Mathematics class will start at 6:00 PM.", read: false, createdAt: ago(0.2) },
  { _id: 'n2', type: 'PAYMENT_SUCCESS', title: '✅ Payment received', message: '₹600 received for 2026-09. Thank you!', read: true, createdAt: ago(25) },
];
export const payments = [
  { _id: 'p1', receiptNo: 'RCT-DEMO01', amount: 600, method: 'UPI', transactionId: 'UPI8842019', paidOn: ago(25), student: students[1], fee: { month: '2026-09' } },
  { _id: 'p2', receiptNo: 'RCT-DEMO02', amount: 600, method: 'CASH', transactionId: '', paidOn: ago(55), student: students[1], fee: { month: '2026-08' } },
];
export const announcements = [
  { _id: 'a1', title: '📢 Important Notice', message: "Tomorrow's Mathematics class will start at 6:00 PM.", priority: 'IMPORTANT', createdAt: ago(0.2) },
  { _id: 'a2', title: 'Diwali holidays', message: 'Classes remain closed from 20 to 24 October.', priority: 'NORMAL', createdAt: ago(3) },
];
