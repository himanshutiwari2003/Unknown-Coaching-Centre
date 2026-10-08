import { useState } from 'react';
import { api } from '../../services/api.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useRealtime } from '../../hooks/useRealtime.js';
import { Badge, Skeleton, ErrorState, Empty } from '../../components/ui.jsx';
import Receipt from '../../components/Receipt.jsx';
import { inr } from '../../utils/format.js';
const load = () => Promise.all([api.myFees(), api.payments()]);
export default function StudentFees() {
  const { data, loading, error, reload } = useAsync(load);
  const [rc, setRc] = useState(null);
  useRealtime('fee:updated', reload);
  if (loading) return <Skeleton />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const [fees, pays] = data;
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">My fees</h1>
      <div className="space-y-3">{fees.map((f) => <div key={f._id} className="card flex items-center justify-between"><div><p className="font-semibold">{f.month}</p><p className="text-xs text-slate-500">Due {new Date(f.dueDate).toDateString()} · Paid {inr(f.paidAmount)} of {inr(f.amount)}</p></div><Badge status={f.status} /></div>)}</div>
      <h2 className="text-lg font-bold">Payment history</h2>
      {!pays.length ? <Empty text="No payments yet. Your receipts will appear here." /> :
        <div className="space-y-3">{pays.map((p) => <div key={p._id} className="card flex items-center justify-between"><div><p className="font-bold">{inr(p.amount)}</p><p className="text-xs text-slate-500">{new Date(p.paidOn).toLocaleDateString('en-IN')} · {p.method} · {p.receiptNo}</p></div><button className="btn-ghost" onClick={() => setRc(p)}>Receipt</button></div>)}</div>}
      {rc && <Receipt payment={rc} onClose={() => setRc(null)} />}
    </div>
  );
}
