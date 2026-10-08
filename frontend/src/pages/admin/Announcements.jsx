import { useState } from 'react';
import { api } from '../../services/api.js';
import { useAsync } from '../../hooks/useAsync.js';
import { Skeleton, ErrorState, Empty, useToast } from '../../components/ui.jsx';
export default function Announcements() {
  const { data, loading, error, reload } = useAsync(api.announcements);
  const [f, setF] = useState({ title: '📢 Important Notice', message: '', type: 'ALL', value: '', priority: 'NORMAL' }); const [busy, setBusy] = useState(false); const toast = useToast();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const send = async () => {
    if (f.message.trim().length < 2) return toast('Write a message first', true);
    if (f.type !== 'ALL' && !f.value) return toast('Choose who should receive it', true);
    setBusy(true);
    try { const r = await api.createAnnouncement({ title: f.title, message: f.message, priority: f.priority, audience: { type: f.type, value: f.value || undefined } }); toast(`Sent to ${r.notified} students`); setF({ ...f, message: '' }); reload(); }
    catch (e) { toast(e.message || 'Unable to send. Please try again.', true); } finally { setBusy(false); }
  };
  return (
    <div className="space-y-4"><h1 className="text-2xl font-extrabold">Announcements</h1>
      <div className="card space-y-3"><input className="input" placeholder="Title" value={f.title} onChange={set('title')} /><textarea className="input min-h-[90px] py-2" placeholder="Message" value={f.message} onChange={set('message')} />
        <div className="grid grid-cols-2 gap-2"><select className="input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value, value: '' })}><option value="ALL">All students</option><option value="CLASS">Specific class</option><option value="BATCH">Specific batch</option></select>
          {f.type === 'CLASS' && <select className="input" value={f.value} onChange={set('value')}><option value="">Select class</option>{[6, 7, 8, 9, 10].map((c) => <option key={c}>Class {c}</option>)}</select>}
          {f.type === 'BATCH' && <input className="input" placeholder="Batch name" value={f.value} onChange={set('value')} />}
          <select className="input" value={f.priority} onChange={set('priority')}><option value="NORMAL">Normal</option><option value="IMPORTANT">Important</option></select></div>
        <button className="btn w-full" disabled={busy} onClick={send}>Send announcement</button></div>
      {loading ? <Skeleton rows={2} /> : error ? <ErrorState message={error} onRetry={reload} /> : !data.length ? <Empty text="No announcements yet." /> : data.map((a) => <div key={a._id} className="card"><p className="font-bold">{a.title}</p><p className="text-sm">{a.message}</p><p className="mt-1 text-xs text-slate-500">{new Date(a.createdAt).toLocaleDateString('en-IN')} · {a.audience?.type || 'ALL'} {a.audience?.value || ''}</p></div>)}
    </div>
  );
}
