import { GraduationCap } from 'lucide-react';
import { Modal, useToast } from './ui.jsx';
import { inr } from '../utils/format.js';
const METHODS = { CASH: 'Cash', UPI: 'UPI', BANK: 'Bank transfer', OTHER: 'Other' };
/** Digital fee receipt. "Download PDF" uses the browser's print dialog (Save as PDF), which works on every Android phone. */
export default function Receipt({ payment: p, status = 'Payment received', onClose }) {
  const toast = useToast(); const s = p.student;
  const rows = [['Student', s.fullName], ['Student ID', s.studentId], ['Class / Batch', `${s.className} / ${s.batch || '-'}`], ['Payment month', p.fee?.month], ['Amount', inr(p.amount)], ['Payment date', new Date(p.paidOn).toLocaleDateString('en-IN', { dateStyle: 'long' })], ['Method', METHODS[p.method]], ['Transaction ID', p.transactionId || '-'], ['Status', status]];
  const share = async () => {
    const text = `Fee receipt ${p.receiptNo}\n${s.fullName} (${s.studentId})\n${inr(p.amount)} paid for ${p.fee?.month}\nUnknown Coaching Centre`;
    try { if (navigator.share) await navigator.share({ title: 'Fee receipt', text }); else { await navigator.clipboard.writeText(text); toast('Receipt text copied'); } }
    catch (e) { if (e.name !== 'AbortError') toast('Unable to share. Please try again.', true); }
  };
  return (
    <Modal title="Payment receipt" onClose={onClose}>
      <div id="receipt" className="rounded-2xl border border-dashed border-slate-300 p-4 dark:border-slate-700">
        <div className="mb-3 text-center"><div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-xl bg-indigo-600 text-white"><GraduationCap /></div><p className="font-extrabold">UNKNOWN COACHING CENTRE</p><p className="text-xs text-slate-500">Receipt no. {p.receiptNo}</p></div>
        <dl className="space-y-2 text-sm">{rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4"><dt className="text-slate-500">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>)}</dl>
        <p className="mt-4 text-center text-xs text-slate-500">Thank you for choosing Unknown Coaching Centre.</p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2"><button className="btn-ghost" onClick={() => window.print()}>Print</button><button className="btn-ghost" onClick={() => window.print()}>PDF</button><button className="btn" onClick={share}>Share</button></div>
    </Modal>
  );
}
