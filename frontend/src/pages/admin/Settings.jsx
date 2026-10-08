import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { useAsync } from '../../hooks/useAsync.js';
import { Skeleton, ErrorState, useToast } from '../../components/ui.jsx';
const fields = [['instituteName', 'Institute name'], ['phone', 'Phone number'], ['email', 'Email'], ['address', 'Address'], ['defaultFee', 'Default monthly fee (₹)'], ['defaultDueDay', 'Default due day (1-28)'], ['session', 'Academic session']];
export default function Settings() {
  const { data, loading, error, reload } = useAsync(api.settings); const [f, setF] = useState(null); const toast = useToast();
  useEffect(() => { if (data) setF(data); }, [data]);
  const save = async () => { try { await api.saveSettings(f); toast('Settings saved'); } catch (e) { toast(e.message || 'Unable to save settings. Please try again.', true); } };
  if (loading || !f) return <Skeleton />; if (error) return <ErrorState message={error} onRetry={reload} />;
  return (
    <div className="space-y-4"><h1 className="text-2xl font-extrabold">Settings</h1>
      <div className="card space-y-3">{fields.map(([k, l]) => <label key={k} className="block text-sm font-semibold">{l}<input className="input mt-1 font-normal" value={f[k] ?? ''} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></label>)}
        <label className="block text-sm font-semibold">Fee reminder message<textarea className="input mt-1 min-h-[120px] py-2 font-normal" value={f.reminderTemplate} onChange={(e) => setF({ ...f, reminderTemplate: e.target.value })} /></label>
        <p className="text-xs text-slate-500">Use {'{amount}'} and {'{month}'} where the pending amount and month should appear.</p>
        <button className="btn w-full" onClick={save}>Save settings</button></div>
    </div>
  );
}
