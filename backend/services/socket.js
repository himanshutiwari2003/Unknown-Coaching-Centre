import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
let io;
/** Real-time layer: each client joins a private room after its JWT is verified. */
export function initSocket(httpServer) {
  io = new Server(httpServer, { cors: { origin: process.env.CLIENT_URL } });
  io.use((socket, next) => {
    try { socket.user = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET); next(); }
    catch { next(new Error('unauthorized')); }
  });
  io.on('connection', (socket) => socket.join(socket.user.role === 'admin' ? 'admins' : `student:${socket.user.id}`));
}
export const emitToStudent = (id, event, data) => io?.to(`student:${id}`).emit(event, data);
export const emitToAdmins = (event, data) => io?.to('admins').emit(event, data);
