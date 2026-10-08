import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAsync } from '../../hooks/useAsync.js';
import { Avatar, Skeleton, ErrorState, useToast } from '../../components/ui.jsx';
import { fileToData } from '../../utils/files.js';
import { inr } from '../../utils/format.js';
export default function Profile() {
  const { data: s, loading, error, reload } = useAsync(api.me); const toast = useToast(); const pick = useRef(null);
  const [f, setF] = useState({}); const [pw, setPw] = useState({ current: '', next: '' });
  if (loading) return <Skeleton rows={3} />; if (error) return <ErrorState message={error} onRetry={reload} />;
  const v = (k) => f[k] ?? s[k] ?? '';
  const save = async () => { try { await api.updateMe({ email: v('email'), address: v('address'), mobile: v('mobile') || undefined }); toast('Profile updated'); reload(); } catch (e) { toast(e.message || 'Unable to save. Please try again.', true); } };
  const photo = async (e) => { try { await api.updateMe({ photoUrl: await fileToData(e.target.files[0]) }); toast('Photo updated'); reload(); } catch { toast('Unable to update photo. Please try again.', true); } };
  const changePw = async () => { try { await api.changePassword(pw.current, pw.next); toast('Password changed'); setPw({ current: '', next: '' }); } catch (e) { toast(e.message || 'Unable to change password.', true); } };
  return (
    <div className="space-y-4"><h1 className="text-2xl font-extrabold">My profile</h1>
      <div className="card flex items-center gap-4"><Avatar s={s} size={72} /><div className="flex-1"><p className="text-lg font-bold">{s.fullName}</p><p className="text-sm text-slate-500">{s.studentId} · {s.className} · {s.batch}</p><p className="text-sm text-slate-500">Monthly fee {inr(s.monthlyFee)}</p></div><input ref={pick} type="file" accept="image/*" hidden onChange={photo} /><button className="btn-ghost" aria-label="Change photo" onClick={() => pick.current.click()}><Camera size={18} /></button></div>
      <div className="card space-y-3"><h2 className="font-bold">Contact details</h2><input className="input" placeholder="Mobile" inputMode="numeric" value={v('mobile')} onChange={(e) => setF({ ...f, mobile: e.target.value })} /><input className="input" placeholder="Email" value={v('email')} onChange={(e) => setF({ ...f, email: e.target.value })} /><input className="input" placeholder="Address" value={v('address')} onChange={(e) => setF({ ...f, address: e.target.value })} /><button className="btn w-full" onClick={save}>Save changes</button></div>
      <div className="card space-y-3"><h2 className="font-bold">Change password</h2><input className="input" type="password" placeholder="Current password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /><input className="input" type="password" placeholder="New password (6+ characters)" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /><button className="btn w-full" disabled={pw.next.length < 6} onClick={changePw}>Change password</button></div>
    </div>
  );
}
