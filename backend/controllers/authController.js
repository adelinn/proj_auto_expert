import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as useri from '../repositories/useri.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await useri.getByEmail(email);
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new useri.create({ nume: name, email, parola: hashedPassword });
    await user.save();

    const payload = { user: { id: user.id, name: user.nume } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '39h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await useri.getByEmail(email);
    const isMatch = await bcrypt.compare(password, user?.password ?? "");
    if (!user || !isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { user: { id: user.id, name: user.nume } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
};