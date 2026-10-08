import jwt from 'jsonwebtoken';
export const signToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
export const protect = (...roles) => (req, res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    if (roles.length && !roles.includes(req.user.role)) return res.status(403).json({ message: 'Access denied' });
    next();
  } catch { res.status(401).json({ message: 'Please sign in again' }); }
};
export const notFound = (req, res) => res.status(404).json({ message: 'Not found' });
export const errorHandler = (err, req, res, _next) => {
  if (err.name === 'ZodError') return res.status(400).json({ message: 'Please check the form fields', issues: err.issues });
  if (err.code === 11000) return res.status(409).json({ message: 'This record already exists' });
  console.error(err); // raw errors stay in server logs only
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Something went wrong. Please try again.' });
};
export const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);
