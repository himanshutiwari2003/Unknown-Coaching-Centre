import { createContext, useContext, useState } from 'react';
import { api } from '../services/api.js';
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('ucc_user') || 'null'));
  const login = async (id, pw) => { const { token, user } = await api.login(id, pw); localStorage.setItem('ucc_token', token); localStorage.setItem('ucc_user', JSON.stringify(user)); setUser(user); return user; };
  const logout = () => { localStorage.removeItem('ucc_token'); localStorage.removeItem('ucc_user'); setUser(null); };
  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}
