import { useRealtime } from '../../hooks/useRealtime.js';
import { api } from '../../services/api.js';
import { useAsync } from '../../hooks/useAsync.js';
import { Badge, Skeleton, ErrorState } from '../../components/ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { inr } from '../../utils/format.js';
export default function StudentHome() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(api.fees);
  useRealtime('fee:updated', reload);
  if (loading) return <Skeleton rows={3} />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data.length) return <div className="card py-10 text-center text-sm text-slate-500">No fee has been created for you yet. Please check again soon.</div>;
  const fee = data.find((x) => x.student.studentId === user.studentId) || data[0];
  const pending = data.filter((x) => x.student._id === fee.student._id).reduce((t, x) => t + x.pendingAmount, 0);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Hello, {user.name.split(' ')[0]}</h1>
      <div className="card space-y-3"><div className="flex justify-between"><p className="font-semibold">Fee for {fee.month}</p><Badge status={fee.status} /></div>
        <p className="text-3xl font-extrabold">{inr(fee.pendingAmount)} <span className="text-sm font-medium text-slate-500">pending</span></p>
        <p className="text-sm text-slate-500">Due on {new Date(fee.dueDate).toDateString()} · Total pending {inr(pending)}</p></div>
    </div>
  );
}
