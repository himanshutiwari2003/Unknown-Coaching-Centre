import { api } from '../../services/api.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useRealtime } from '../../hooks/useRealtime.js';
import { emitDemo } from '../../services/realtime.js';
import { Skeleton, ErrorState, Empty, useToast } from '../../components/ui.jsx';
const icon = { FEE_REMINDER: '🔔', PAYMENT_SUCCESS: '✅', PAYMENT_PENDING: '⏳', RECEIPT: '🧾', ANNOUNCEMENT: '📢', CLASS_ANNOUNCEMENT: '🏫', IMPORTANT: '⚠️' };
const label = { FEE_REMINDER: 'Fee reminder', PAYMENT_SUCCESS: 'Payment successful', PAYMENT_PENDING: 'Payment pending', RECEIPT: 'Receipt', ANNOUNCEMENT: 'Announcement', CLASS_ANNOUNCEMENT: 'Class announcement', IMPORTANT: 'Important notice' };
export default function StudentNotifications() {
  const { data, loading, error, reload } = useAsync(api.notifications);
  const toast = useToast();
  useRealtime('notification', reload); // new alerts appear instantly
  const markAll = async () => { try { await api.markAllRead(); emitDemo('notifications:read'); reload(); } catch { toast('Unable to update. Please try again.', true); } };
  if (loading) return <Skeleton />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const unread = data.filter((n) => !n.read).length;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-extrabold">Notifications</h1>{unread > 0 && <button className="btn-ghost" onClick={markAll}>Mark all as read</button>}</div>
      {!data.length ? <Empty text="You're all caught up. New fee reminders and notices will show up here." /> :
        <div className="space-y-3">{data.map((n) => <div key={n._id} className={`card ${n.read ? '' : 'border-l-4 border-l-indigo-600'}`}><div className="flex items-center justify-between text-xs text-slate-500"><span>{icon[n.type]} {label[n.type]}</span><span>{new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span></div><p className="mt-1 font-bold">{n.title}</p><p className="whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">{n.message}</p></div>)}</div>}
    </div>
  );
}
