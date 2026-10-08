import { api } from '../../services/api.js';
import { useAsync } from '../../hooks/useAsync.js';
import { Skeleton, ErrorState, Empty } from '../../components/ui.jsx';
export default function StudentAnnouncements() {
  const { data, loading, error, reload } = useAsync(api.announcements);
  if (loading) return <Skeleton />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  return (
    <div className="space-y-4"><h1 className="text-2xl font-extrabold">Announcements</h1>
      {!data.length ? <Empty text="No announcements yet." /> : data.map((a) => <div key={a._id} className="card"><div className="flex items-center justify-between"><p className="font-bold">{a.title}</p>{a.priority === 'IMPORTANT' && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">Important</span>}</div><p className="mt-1 text-sm">{a.message}</p><p className="mt-2 text-xs text-slate-500">{new Date(a.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p></div>)}
    </div>
  );
}
