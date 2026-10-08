import { useState } from 'react';
import { BellRing, IndianRupee } from 'lucide-react';
import { useRealtime } from '../../hooks/useRealtime.js';
import { api } from '../../services/api.js';
import { useAsync } from '../../hooks/useAsync.js';
import { Badge, Skeleton, ErrorState, Empty, Modal, useToast } from '../../components/ui.jsx';
import Receipt from '../../components/Receipt.jsx';
import { inr, daysOverdue } from '../../utils/format.js';
const filters = ['ALL', 'PAID', 'PARTIAL', 'PENDING', 'OVERDUE'];
export default function Fees() {
  const { data, loading, error, reload } = useAsync(api.fees);
  useRealtime('fee:updated', reload);
  const [rc, setRc] = useState(null); const [f, setF] = useState('ALL'); const [pay, setPay] = useState(null); const [amount, setAmount] = useState(''); const [method, setMethod] = useState('CASH'); const [txn, setTxn] = useState('');
  const toast = useToast();
  const rows = (data || []).filter((x) => f === 'ALL' || x.status === f);
  const openPay = (fee) => { setPay(fee); setAmount(fee.pendingAmount); setTxn(''); };
  const submit = async () => { try { const r = await api.pay({ fee: pay._id, amount: Number(amount), method, transactionId: txn }); toast('Payment saved. Parent notified.'); setRc({ ...r.payment, student: pay.student, fee: { month: pay.month }, status: Number(amount) >= pay.pendingAmount ? 'Fully paid' : 'Partially paid' }); setPay(null); reload(); } catch (e) { toast(e.message || 'Unable to save payment. Please try again.', true); } };
  const remind = async (id) => { try { await api.remind(id); toast('Reminder sent'); } catch { toast('Unable to send reminder. Please try again.', true); } };
  const gen = async () => { try { const r = await api.generateMonth(); toast(r.created ? `Created ${r.created} fee records` : 'This month is already up to date'); reload(); } catch { toast('Unable to create fees. Please try again.', true); } };
  const remindAll = async () => { try { const r = await api.remindAll(); toast(`Reminder sent to ${r.sent} students`); } catch { toast('Unable to send reminders. Please try again.', true); } };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-extrabold">Fees</h1><div className="flex gap-2"><button className="btn-ghost" onClick={gen}>Create this month's fees</button><button className="btn" onClick={remindAll}><BellRing size={16} />Remind all</button></div></div>
      <div className="flex gap-2 overflow-x-auto">{filters.map((x) => <button key={x} onClick={() => setF(x)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${f === x ? 'bg-indigo-600 text-white' : 'bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800'}`}>{x === 'ALL' ? 'All' : x[0] + x.slice(1).toLowerCase()}</button>)}</div>
      {loading ? <Skeleton /> : error ? <ErrorState message={error} onRetry={reload} /> : !rows.length ? <Empty text="No fee records in this view." /> :
        <div className="grid gap-3 md:grid-cols-2">{rows.map((x) => <div key={x._id} className="card space-y-3">
          <div className="flex items-start justify-between"><div><p className="font-semibold">{x.student.fullName}</p><p className="text-xs text-slate-500">{x.student.className} · {x.student.batch} · {x.month}</p></div><Badge status={x.status} /></div>
          <div className="grid grid-cols-3 text-center text-sm"><div><p className="text-xs text-slate-500">Fee</p><b>{inr(x.amount)}</b></div><div><p className="text-xs text-slate-500">Paid</p><b>{inr(x.paidAmount)}</b></div><div><p className="text-xs text-slate-500">Pending</p><b>{inr(x.pendingAmount)}</b></div></div>
          {x.status !== 'PAID' && <div className="flex items-center gap-2"><button className="btn flex-1" onClick={() => openPay(x)}><IndianRupee size={16} />Record payment</button><button className="btn-ghost" onClick={() => remind(x._id)} aria-label="Send reminder"><BellRing size={16} /></button></div>}
          {x.status === 'OVERDUE' && <p className="text-xs text-rose-600">{daysOverdue(x.dueDate)} days overdue</p>}</div>)}</div>}
      {rc && <Receipt payment={rc} status={rc.status} onClose={() => setRc(null)} />}
      {pay && <Modal title={`Payment: ${pay.student.fullName}`} onClose={() => setPay(null)}><div className="space-y-3">
        <input className="input" type="number" value={amount} max={pay.pendingAmount} onChange={(e) => setAmount(e.target.value)} />
        <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}><option value="CASH">Cash</option><option value="UPI">UPI</option><option value="BANK">Bank transfer</option><option value="OTHER">Other</option></select>
        {method !== 'CASH' && <input className="input" placeholder="Transaction ID" value={txn} onChange={(e) => setTxn(e.target.value)} />}
        <button className="btn w-full" onClick={submit} disabled={!(Number(amount) > 0 && Number(amount) <= pay.pendingAmount)}>Save payment</button></div></Modal>}
    </div>
  );
}
