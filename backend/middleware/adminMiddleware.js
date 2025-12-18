export default function admin(req, res, next) {
  // Expect JWT to include isAdmin boolean in user payload
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ msg: 'Admin privileges required' });
  }
  next();
}