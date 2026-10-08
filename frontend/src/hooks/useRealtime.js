import { useEffect, useRef } from 'react';
import { bus } from '../services/realtime.js';
export function useRealtime(event, handler) {
  const ref = useRef(handler); ref.current = handler;
  useEffect(() => { const fn = (e) => ref.current(e.detail); bus.addEventListener(event, fn); return () => bus.removeEventListener(event, fn); }, [event]);
}
