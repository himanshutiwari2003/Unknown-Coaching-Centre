import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { UserPlus, IndianRupee, BellRing, Megaphone, Clock } from 'lucide-react';
import { useRealtime } from '../../hooks/useRealtime.js';
import { api } from '../../services/api.js';
import { useAsync } from '../../hooks/useAsync.js';
import { Skeleton, ErrorState } from '../../components/ui.jsx';
import { inr } from '../../utils/format.js';
const actions = [['/admin/students', 'Add student', UserPlus], ['/admin/fees', 'Record payment', IndianRupee], ['/admin/fees', 'Send reminders', BellRing], ['/admin/announcements', 'New notice', Megaphone], ['/admin/fees', 'Pending fees', Clock]];
export default function Dashboard() {
  const { data: d, loading, error, reload } = useAsync(api.stats);
  useRealtime('fee:updated', reload);
  if (loading) return <Skeleton rows={6} />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const cards = [['Total students', d.total], ['Active students', d.active], ['Paid this month', d.paid], ['Pending this month', d.pending], ['Total collection', inr(d.collection)], ['Pending amount', inr(d.pendingAmount)]];
  const pie = [{ name: 'Paid', value: d.paid, c: '#10b981' }, { name: 'Pending', value: d.pending, c: '#f43f5e' }];
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">Dashboard</h1>
      <div className="flex gap-2 overflow-x-auto pb-1">{actions.map(([to, label, Icon]) => <Link key={label} to={to} className="btn-ghost shrink-0"><Icon size={16} />{label}</Link>)}</div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">{cards.map(([l, v]) => <div key={l} className="card"><p className="text-xs text-slate-500">{l}</p><p className="mt-1 text-2xl font-extrabold">{v}</p></div>)}</div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card"><h2 className="mb-3 font-bold">Monthly collection</h2><ResponsiveContainer height={220}><BarChart data={d.trend}><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis width={45} /><Tooltip /><Bar dataKey="collected" fill="#4f46e5" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div>
        <div className="card"><h2 className="mb-3 font-bold">Paid vs pending</h2><ResponsiveContainer height={220}><PieChart><Pie data={pie} dataKey="value" innerRadius={55} outerRadius={85} label>{pie.map((p) => <Cell key={p.name} fill={p.c} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
        <div className="card lg:col-span-2"><h2 className="mb-3 font-bold">Students by class</h2><ResponsiveContainer height={200}><BarChart data={d.byClass}><XAxis dataKey="name" /><YAxis allowDecimals={false} width={30} /><Tooltip /><Bar dataKey="count" fill="#818cf8" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </div>
    </div>
  );
}
