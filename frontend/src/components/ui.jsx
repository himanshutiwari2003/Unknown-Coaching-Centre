import { useState, useCallback, createContext, useContext } from 'react';
import { statusStyle } from '../utils/format.js';
export const Avatar = ({ s, size = 44 }) => s.photoUrl ? <img src={s.photoUrl} alt= width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} /> : <div className="grid shrink-0 place-items-center rounded-full bg-indigo-100 font-bold text-indigo-700" style={{ width: size, height: size }}>{s.fullName?.[0]}</div>;
export const Badge = ({ status }) => <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[status]}`}>{status}</span>;
export const Skeleton = ({ rows = 4 }) => <div className="space-y-3">{Array.from({ length: rows }, (_, i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />)}</div>;
export const ErrorState = ({ message, onRetry }) => <div className="card text-center"><p className="mb-3 text-sm text-rose-600">{message}</p><button className="btn" onClick={onRetry}>Try again</button></div>;
export const Empty = ({ text }) => <div className="card py-10 text-center text-sm text-slate-500">{text}</div>;
export const Modal = ({ title, onClose, children }) => <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}><div className="max-h-[90vh] w-full overflow-auto rounded-t-3xl bg-white p-5 dark:bg-slate-900 sm:max-w-md sm:rounded-3xl" onClick={(e) => e.stopPropagation()}><h2 className="mb-4 text-lg font-bold">{title}</h2>{children}</div></div>;
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }) {
  const [t, setT] = useState(null);
  const show = useCallback((msg, error) => { setT({ msg, error }); setTimeout(() => setT(null), 3000); }, []);
  return <ToastCtx.Provider value={show}>{children}{t && <div className={`fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg md:bottom-6 ${t.error ? 'bg-rose-600' : 'bg-slate-900'}`}>{t.msg}</div>}</ToastCtx.Provider>;
}
