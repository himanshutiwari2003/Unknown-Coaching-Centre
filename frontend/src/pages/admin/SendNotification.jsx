import { useState } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../components/ui.jsx';
const templates = [['Fee reminder', '🔔 Fee Reminder', 'Dear Parent/Student, your monthly fee is pending. Please complete the payment before the due date.\n\nUnknown Coaching Centre'], ['Class notice', '📢 Class Notice', "Tomorrow's class will start at 6:00 PM."], ['Holiday', '🏖️ Holiday', 'The institute will remain closed tomorrow.']];
export default function SendNotification() {
  const [mobile, setMobile] = useState(''); const [title, setTitle] = useState(''); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false); const toast = useToast();
  const send = async () => {
    if (!/^\d{10}$/.test(mobile)) return toast('Enter a 10-digit mobile number', true);
    if (!title.trim() || !message.trim()) return toast('Add a title and message', true);
    setBusy(true);
    try { const r = await api.sendByMobile(mobile, title, message); toast(`Notification sent to ${r.sent} student${r.sent > 1 ? 's' : ''}`); setMessage(''); } catch (e) { toast(e.message || 'Unable to send. Please try again.', true); } finally { setBusy(false); }
  };
  return (
    <div className="space-y-4"><h1 className="text-2xl font-extrabold">Send notification</h1>
      <div className="card space-y-3"><p className="text-sm text-slate-500">Type the parent or student mobile number. Only that student gets the notification, instantly.</p>
        <input className="input" inputMode="numeric" placeholder="Mobile number" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} />
        <div className="flex gap-2 overflow-x-auto">{templates.map(([n, t, m]) => <button key={n} className="btn-ghost shrink-0 !min-h-[38px]" onClick={() => { setTitle(t); setMessage(m); }}>{n}</button>)}</div>
        <input className="input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} /><textarea className="input min-h-[100px] py-2" placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
        <button className="btn w-full" disabled={busy} onClick={send}>Send notification</button></div>
    </div>
  );
}
