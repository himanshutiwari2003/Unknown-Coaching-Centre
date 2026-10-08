import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Plus, Search, UserX } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAsync } from '../../hooks/useAsync.js';
import { Avatar, Skeleton, ErrorState, Empty, Modal, useToast } from '../../components/ui.jsx';
import { fileToData } from '../../utils/files.js';
import { inr } from '../../utils/format.js';
const schema = z.object({ fullName: z.string().min(2, 'Enter full name'), parentMobile: z.string().regex(/^\d{10}$/, 'Enter 10 digits'), mobile: z.string().regex(/^\d{10}$/, 'Enter 10 digits').optional().or(z.literal('')), className: z.string().min(1, 'Select class'), batch: z.string().optional(), monthlyFee: z.coerce.number().min(0, 'Enter fee') });
export default function Students() {
  const { data, loading, error, reload } = useAsync(api.students);
  const [q, setQ] = useState(''); const [cls, setCls] = useState(''); const [open, setOpen] = useState(false); const [pw, setPw] = useState(null); const [photo, setPhoto] = useState(null);
  const pick = useRef(null); const target = useRef(null); const toast = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });
  const save = async (v) => { try { const r = await api.addStudent({ ...v, mobile: v.mobile || undefined, photoUrl: photo || undefined }); setOpen(false); setPhoto(null); setPw(r.tempPassword); reload(); } catch (e) { toast(e.message || 'Unable to save student. Please try again.', true); } };
  const choose = async (e) => { const f = e.target.files[0]; e.target.value = ''; if (!f) return; try { const d = await fileToData(f); if (target.current) { await api.updateStudent(target.current, { photoUrl: d }); toast('Photo saved'); reload(); } else setPhoto(d); } catch { toast('Unable to read this photo. Try another.', true); } };
  const remove = async (s) => { if (!confirm(`Deactivate ${s.fullName}? Their fee history is kept.`)) return; try { await api.deactivate(s._id); toast('Student deactivated'); reload(); } catch { toast('Unable to deactivate. Please try again.', true); } };
  const rows = (data || []).filter((s) => (!cls || s.className === cls) && `${s.fullName} ${s.studentId} ${s.mobile} ${s.parentMobile}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-4">
      <input ref={pick} type="file" accept="image/*" hidden onChange={choose} />
      <div className="flex items-center justify-between"><h1 className="text-2xl font-extrabold">Students</h1><button className="btn" onClick={() => { target.current = null; setOpen(true); }}><Plus size={18} />Add student</button></div>
      <div className="flex gap-2"><div className="relative flex-1"><Search size={16} className="absolute left-3 top-3.5 text-slate-400" /><input className="input pl-9" placeholder="Search name, ID or mobile" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select className="input w-32" value={cls} onChange={(e) => setCls(e.target.value)}><option value="">All classes</option>{[6, 7, 8, 9, 10].map((c) => <option key={c}>Class {c}</option>)}</select></div>
      {loading ? <Skeleton /> : error ? <ErrorState message={error} onRetry={reload} /> : !rows.length ? <Empty text="No students match. Add your first student to get started." /> :
        <div className="grid gap-3 md:grid-cols-2">{rows.map((s) => <div key={s._id} className="card flex items-center gap-3"><Avatar s={s} /><div className="min-w-0 flex-1"><p className="truncate font-semibold">{s.fullName}</p><p className="text-xs text-slate-500">{s.studentId} · {s.className} · {s.batch}</p><p className="text-xs text-slate-500">📱 {s.parentMobile}</p></div>
          <div className="text-right"><p className="text-sm font-bold">{inr(s.monthlyFee)}</p><div className="mt-1 flex gap-1"><button className="btn-ghost !min-h-[36px] !px-2" aria-label="Change photo" onClick={() => { target.current = s._id; pick.current.click(); }}><Camera size={16} /></button><button className="btn-ghost !min-h-[36px] !px-2" aria-label="Deactivate" onClick={() => remove(s)}><UserX size={16} /></button></div></div></div>)}</div>}
      {open && <Modal title="Add student" onClose={() => setOpen(false)}><form onSubmit={handleSubmit(save)} className="space-y-3">
        <div className="flex items-center gap-3"><Avatar s={{ fullName: '+', photoUrl: photo }} size={56} /><button type="button" className="btn-ghost" onClick={() => { target.current = null; pick.current.click(); }}><Camera size={16} />Add photo</button></div>
        {[['fullName', 'Full name'], ['parentMobile', 'Parent mobile (login ID)'], ['mobile', 'Student mobile (optional)'], ['batch', 'Batch (Morning / Evening)'], ['monthlyFee', 'Monthly fee (₹)']].map(([k, p]) => <div key={k}><input className="input" placeholder={p} {...register(k)} /><p className="mt-1 text-xs text-rose-600">{errors[k]?.message}</p></div>)}
        <select className="input" {...register('className')}><option value="">Select class</option>{[6, 7, 8, 9, 10].map((c) => <option key={c}>Class {c}</option>)}</select><p className="text-xs text-rose-600">{errors.className?.message}</p>
        <button className="btn w-full" disabled={isSubmitting}>Save student</button></form></Modal>}
      {pw && <Modal title="Student added" onClose={() => setPw(null)}><p className="text-sm">Share this one-time password with the parent. It will not be shown again. Login ID: parent mobile number.</p><p className="my-4 rounded-xl bg-slate-100 p-4 text-center font-mono text-xl font-bold dark:bg-slate-800">{pw}</p><button className="btn w-full" onClick={() => setPw(null)}>Done</button></Modal>}
    </div>
  );
}
