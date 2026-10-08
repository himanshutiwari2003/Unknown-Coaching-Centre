import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import routes from './routes/index.js';
import { User } from './models/index.js';
import { startDailyReport } from './services/dailyReport.js';
import { initSocket } from './services/socket.js';
import { notFound, errorHandler } from './middleware/auth.js';
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set');
const app = express();
const self = ["'self'"];
app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: self, scriptSrc: self, workerSrc: self, manifestSrc: self, styleSrc: [...self, "'unsafe-inline'", 'https://fonts.googleapis.com'], fontSrc: [...self, 'https://fonts.gstatic.com'], imgSrc: [...self, 'data:', 'blob:'], connectSrc: [...self, 'ws:', 'wss:'] } } }));
app.use(cors({ origin: process.env.CLIENT_URL || false }), express.json({ limit: '1mb' }));
app.get('/api/health', (_q, r) => r.json({ ok: true }));
app.use('/api', routes);
// One-service deploy: the API also serves the built website
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '../frontend/dist');
if (fs.existsSync(dist)) { app.use(express.static(dist)); app.get(/^\/(?!api|socket\.io).*/, (_q, r) => r.sendFile(path.join(dist, 'index.html'))); }
app.use(notFound, errorHandler);
await connectDB();
// First start: create the admin from env vars if none exists (no terminal needed)
const { SEED_ADMIN_EMAIL: email, SEED_ADMIN_PASSWORD: pw } = process.env;
if (email && pw && !(await User.countDocuments())) { await User.create({ name: 'Admin', email, passwordHash: await bcrypt.hash(pw, 12) }); console.log('First admin created:', email); }
const server = createServer(app);
initSocket(server);
startDailyReport();
server.listen(process.env.PORT || 5000, () => console.log('API running'));
