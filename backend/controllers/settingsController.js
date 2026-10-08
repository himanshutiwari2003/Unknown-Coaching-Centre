import { z } from 'zod';
import { Settings } from '../models/index.js';
export const getSettings = () => Settings.findOneAndUpdate({ key: 'main' }, { $setOnInsert: { key: 'main' } }, { upsert: true, new: true });
export async function get(req, res) { res.json(await getSettings()); }
export async function update(req, res) {
  const d = z.object({ instituteName: z.string().min(2), phone: z.string().optional(), email: z.string().optional(), address: z.string().optional(),
    defaultFee: z.coerce.number().min(0), defaultDueDay: z.coerce.number().min(1).max(28), session: z.string().optional(), reminderTemplate: z.string().min(10) }).parse(req.body);
  res.json(await Settings.findOneAndUpdate({ key: 'main' }, d, { upsert: true, new: true }));
}
