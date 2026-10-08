import { useCallback, useState } from 'react';
import { api } from '../../services/api.js';
import { useAsync } from '../../hooks/useAsync.js';
import { Skeleton, ErrorState, Empty } from '../../components/ui.jsx';
import { downloadCsv } from '../../utils/files.js';
import { inr } from '../../utils/format.js';
const tabs = ['Daily collection', 'Monthly collection', 'Pending fees', 'Overdue fees', 'Class-wise'];
const group = (list, key) => list.reduce((m, x) => { const k = key(x); (m[k] ||= []).push(x); return m; }, {});
export default function Reports() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); const [cls, setCls] = useState(''); const [tab, setTab] = useState(tabs[0]);
  const load = useCallback(async () => { const [y, m] = month.split('-').map(Number); const to = `${month}-${String(new Date(y, m, 0).getDate()).padStart(2, '0')}`; return Promise.all([api.fees(month), api.paymentsReport(`${month}-01`, to)]); }, [month]);
  const { data, loading, error, reload } = useAsync(load);
  let cols = [], rows = [];
  if (data) {
    const fees = data[0].filter((f) => !cls || f.student.className === cls); const pays = data[1].filter((p) => !cls || p.student?.className === cls);
    const ym = (p) => new Date(p.paidOn).toISOString().slice(0, 7); const inMonth = pays.filter((p) => ym(p) === month);
    if (tab === tabs[0]) { cols = ['Date', 'Payments', 'Collected']; rows = Object.entries(group(inMonth, (p) => new Date(p.paidOn).toLocaleDateString('en-IN'))).map(([d, l]) => [d, l.length, l.reduce((t, p) => t + p.amount, 0)]); }
    if (tab === tabs[1]) { const billed = fees.reduce((t, f) => t + f.amount, 0), got = inMonth.reduce((t, p) => t + p.amount, 0); cols = ['Measure', 'Value']; rows = [['Fees billed', billed], ['Collected', got], ['Pending', billed - fees.reduce((t, f) => t + f.paidAmount, 0)], ['Payments', inMonth.length]]; }
    if (tab === tabs[2] || tab === tabs[3]) { cols = ['Student', 'Class', 'Parent mobile', 'Pending', 'Due date', 'Status']; rows = fees.filter((f) => f.status !== 'PAID' && (tab === tabs[2] || f.status === 'OVERDUE')).map((f) => [f.student.fullName, f.student.className, f.student.parentMobile, f.pendingAmount, new Date(f.dueDate).toLocaleDateString('en-IN'), f.status]); }
    if (tab === tabs[4]) { cols = ['Class', 'Payments', 'Collected']; rows = Object.entries(group(inMonth, (p) => p.student?.className || '-')).sort().map(([c, l]) => [c, l.length, l.reduce((t, p) => t + p.amount, 0)]); }
  }
  return (
    <div className="space-y-4"><h1 className="noprint text-2xl font-extrabold">Reports</h1>
      <div className="noprint flex flex-wrap gap-2"><input type="month" className="input w-44" value={month} onChange={(e) => setMonth(e.target.value)} /><select className="input w-36" value={cls} onChange={(e) => setCls(e.target.value)}><option value="">All classes</option>{[6, 7, 8, 9, 10].map((c) => <option key={c}>Class {c}</option>)}</select></div>
      <div className="noprint flex gap-2 overflow-x-auto">{tabs.map((t) => <button key={t} onClick={() => setTab(t)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${tab === t ? 'bg-indigo-600 text-white' : 'bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800'}`}>{t}</button>)}</div>
      {loading ? <Skeleton /> : error ? <ErrorState message={error} onRetry={reload} /> : !rows.length ? <Empty text="Nothing to show for this month and class." /> :
        <div id="report" className="card overflow-x-auto"><p className="mb-3 font-bold">Unknown Coaching Centre · {tab} · {month}</p><table className="w-full text-left text-sm"><thead><tr>{cols.map((c) => <th key={c} className="border-b p-2">{c}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i}>{r.map((v, j) => <td key={j} className="border-b border-slate-100 p-2 dark:border-slate-800">{typeof v === 'number' && /Collected|Pending|Value|billed/i.test(cols[j]) ? inr(v) : v}</td>)}</tr>)}</tbody></table></div>}
      {rows.length > 0 && <div className="noprint flex gap-2"><button className="btn" onClick={() => downloadCsv(`${tab}-${month}.csv`, cols, rows)}>Export CSV</button><button className="btn-ghost" onClick={() => window.print()}>Print / Save PDF</button></div>}
    </div>
  );
}
