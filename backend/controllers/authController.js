import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as useri from '../repositories/useri.js';
import { ZodError } from 'zod';
import logger from '../server/logger.js';

export function isZodError(err) {
  return Boolean(
    err && (err instanceof ZodError || err.name === 'ZodError'),
  );
}

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  const log = req?.log || logger;
  try {
    let user = await useri.getByEmail(email);
    if (user) {
      log.warn({ email }, 'Registration attempt with existing email');
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = await useri.create({ nume: username, email, parola: password });

    const payload = { user: { id: user.id, name: user.nume } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '39h' }, (err, token) => {
      if (err) {
        log.error({ err, userId: user.id }, 'JWT signing error during registration');
        return res.status(500).json({ msg: 'Server error' });
      }
      log.info({ userId: user.id, email }, 'User registered successfully');
      res.json({ token });
    });
  } catch (err) {
    log.error({ err, email, username }, 'Error during user registration');
    if (isZodError(err)) {
      return res.status(500).send('Server error');
    }
    return res.status(500).send('Server error: '+err.message);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const log = req?.log || logger;
  try {
    let user = await useri.getByEmail(email);
    const isMatch = await bcrypt.compare(password, user?.parola ?? "");
    if (!user || !isMatch) {
      log.warn({ email }, 'Failed login attempt - invalid credentials');
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = { user: { id: user.id, name: user.nume } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15h' }, (err, token) => {
      if (err) {
        log.error({ err, userId: user.id }, 'JWT signing error during login');
        return res.status(500).json({ msg: 'Server error' });
      }
      log.info({ userId: user.id, email }, 'User logged in successfully');
      res.json({ token });
    });
  } catch (err) {
    log.error({ err, email }, 'Error during user login');
    res.status(500).send('Server error');
  }
};