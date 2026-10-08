import { useCallback, useEffect, useState } from 'react';
export function useAsync(fn) {
  const [state, set] = useState({ data: null, loading: true, error: '' });
  const run = useCallback(() => { set((s) => ({ ...s, loading: true, error: '' })); fn().then((data) => set({ data, loading: false, error: '' })).catch((e) => set({ data: null, loading: false, error: e.message })); }, [fn]);
  useEffect(run, [run]);
  return { ...state, reload: run };
}
