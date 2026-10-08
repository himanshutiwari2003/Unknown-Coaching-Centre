import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { isDemo } from '../services/api.js';
export default function Login() {
  const { login } = useAuth(); const nav = useNavigate();
  const [id, setId] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (e) => { e.preventDefault(); setBusy(true); setErr('');
    try { const u = await login(id.trim(), pw); nav(`/${u.role}/dashboard`); } catch (x) { setErr(x.message); } finally { setBusy(false); } };
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-indigo-600 to-indigo-800 p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-6">
        <div className="text-center"><div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-indigo-600 text-white"><GraduationCap size={30} /></div><h1 className="text-lg font-extrabold">UNKNOWN COACHING CENTRE</h1><p className="text-sm text-slate-500">Admin: email. Student/parent: mobile number or Student ID</p></div>
        <input className="input" placeholder="Email, mobile number or Student ID" value={id} onChange={(e) => setId(e.target.value)} required />
        <input className="input" type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={isDemo ? 1 : 6} />
        {err && <p className="text-sm text-rose-600">{err}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        {isDemo && <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Demo mode: type any email (admin) or any ID (student) with any password.</p>}
      </form>
    </div>
  );
}
