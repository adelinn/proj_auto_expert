import jwt from 'jsonwebtoken';
import logger from '../server/logger.js';

export default function auth(req, res, next) {
  const token = req.header('Authorization');
  const log = req?.log || logger;
  
  if (!token) {
    log.warn({ path: req.path, method: req.method }, 'Authentication failed - no token provided');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    log.warn({ err, path: req.path, method: req.method }, 'Authentication failed - invalid token');
    res.status(401).json({ msg: 'Token is not valid' });
  }
}