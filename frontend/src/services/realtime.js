import { io } from 'socket.io-client';
import { isDemo } from './api.js';
/** Single event bus. Real mode: fed by Socket.IO. Demo mode: fed locally by the mock API. */
export const bus = new EventTarget();
export const emitDemo = (name, detail) => bus.dispatchEvent(new CustomEvent(name, { detail }));
let socket;
export function connectRealtime() {
  if (isDemo || socket) return;
  socket = io(import.meta.env.VITE_API_URL || window.location.origin, { auth: { token: localStorage.getItem('ucc_token') } });
  ['notification', 'fee:updated'].forEach((e) => socket.on(e, (d) => emitDemo(e, d)));
}
export function disconnectRealtime() { socket?.disconnect(); socket = null; }
