import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { connectRealtime, disconnectRealtime } from '../services/realtime.js';
import { useRealtime } from '../hooks/useRealtime.js';
import { useToast } from '../components/ui.jsx';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Wallet, Bell, Megaphone, BarChart3, LogOut, GraduationCap, Moon, Settings, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
const adminNav = [['dashboard', 'Dashboard', LayoutDashboard], ['students', 'Students', Users], ['fees', 'Fees', Wallet], ['notifications', 'Alerts', Bell], ['announcements', 'Notices', Megaphone], ['reports', 'Reports', BarChart3], ['settings', 'Settings', Settings]];
const studentNav = [['dashboard', 'Home', LayoutDashboard], ['fees', 'Fees', Wallet], ['notifications', 'Alerts', Bell], ['announcements', 'Notices', Megaphone], ['profile', 'Profile', User]];
export default function AppLayout() {
  const { user, logout } = useAuth(); const nav = useNavigate();
  const base = user.role === 'admin' ? '/admin' : '/student'; const items = user.role === 'admin' ? adminNav : studentNav;
  const link = ({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`;
  const toast = useToast(); const [unread, setUnread] = useState(0);
  const count = () => user.role === 'student' && api.notifications().then((d) => setUnread(d.filter((n) => !n.read).length)).catch(() => {});
  useEffect(() => { count(); }, []);
  useRealtime('notification', () => count());
  useRealtime('notifications:read', () => setUnread(0));
  useEffect(() => { connectRealtime(); return disconnectRealtime; }, []);
  useRealtime('notification', (n) => user.role === 'student' && toast(`${n.title}: ${n.message.slice(0, 60)}`));
  const out = () => { logout(); nav('/login'); };
  return (
    <div className="min-h-screen md:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:flex">
        <div className="mb-6 flex items-center gap-3 px-2"><div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white"><GraduationCap size={22} /></div><div className="text-sm font-extrabold leading-tight">UNKNOWN<br />COACHING CENTRE</div></div>
        <nav className="flex-1 space-y-1">{items.map(([to, label, Icon]) => <NavLink key={to} to={`${base}/${to}`} className={link}><Icon size={18} />{label}{to === 'notifications' && unread > 0 && <b className="ml-auto rounded-full bg-rose-600 px-2 text-xs text-white">{unread}</b>}</NavLink>)}</nav>
        <button className="btn-ghost mb-2" onClick={() => document.documentElement.classList.toggle('dark')}><Moon size={16} />Dark mode</button>
        <button className="btn-ghost" onClick={out}><LogOut size={16} />Sign out</button>
      </aside>
      <header className="sticky top-0 z-30 flex items-center justify-between bg-indigo-600 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-white md:hidden"><span className="text-sm font-extrabold">UNKNOWN COACHING CENTRE</span><div className="flex items-center gap-4">{user.role === 'admin' && <NavLink to="/admin/settings" aria-label="Settings"><Settings size={20} /></NavLink>}<button onClick={out} aria-label="Sign out"><LogOut size={20} /></button></div></header>
      <main className="mx-auto max-w-6xl p-4 pb-28 md:p-8"><Outlet /></main>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-slate-800 dark:bg-slate-900 md:hidden">
        {items.filter(([to]) => to !== 'settings').slice(0, 6).map(([to, label, Icon]) => <NavLink key={to} to={`${base}/${to}`} className={({ isActive }) => `flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}><span className="relative"><Icon size={20} />{to === 'notifications' && unread > 0 && <b className="absolute -right-2 -top-1 rounded-full bg-rose-600 px-1.5 text-[10px] text-white">{unread}</b>}</span>{label}</NavLink>)}
      </nav>
    </div>
  );
}
