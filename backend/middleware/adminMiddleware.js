import logger from '../server/logger.js';

export default function admin(req, res, next) {
  const log = req?.log || logger;
  // Expect JWT to include isAdmin boolean in user payload
  if (!req.user || !req.user.isAdmin) {
    log.warn({ 
      userId: req.user?.id, 
      path: req.path, 
      method: req.method 
    }, 'Admin access denied - insufficient privileges');
    return res.status(403).json({ msg: 'Admin privileges required' });
  }
  next();
}