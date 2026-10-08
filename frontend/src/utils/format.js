export const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
export const daysOverdue = (due) => Math.max(0, Math.floor((Date.now() - new Date(due)) / 864e5));
export const statusStyle = { PAID: 'bg-emerald-100 text-emerald-700', PARTIAL: 'bg-amber-100 text-amber-700', PENDING: 'bg-rose-100 text-rose-700', OVERDUE: 'bg-slate-200 text-slate-700' };
