import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

//  întrebări pe categorii (A/B/C/D/Tr)
import { getQuestionsByCategory } from './questions/index.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ! temporar (mai târziu va fi MySQL)
const users = [];

// =======================
// Middleware JWT
// =======================
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({
      message: 'Lipsește token-ul (Authorization: Bearer ...)'
    });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({
      message: 'Token invalid sau expirat'
    });
  }
}

// =======================
// Helpers
// =======================
function shuffle(arr) {
  return arr
    .map(x => ({ x, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map(o => o.x);
}

// =======================
// TEST SERVER
// =======================
app.get('/', (req, res) => {
  res.send('Backend funcționează ok');
});

// =======================
// REGISTER
// =======================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email și parolă obligatorii'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Parola minim 6 caractere'
      });
    }

    const exists = users.find(u => u.email === email.toLowerCase());
    if (exists) {
      return res.status(409).json({
        message: 'Email deja folosit'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
      id: users.length + 1,
      email: email.toLowerCase(),
      passwordHash,
      name: name || ''
    };

    users.push(user);

    res.status(201).json({
      message: 'User creat cu succes',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (err) {
    res.status(500).json({
      message: 'Eroare la register',
      error: err.message
    });
  }
});

// =======================
// LOGIN
// =======================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email și parolă obligatorii'
      });
    }

    const user = users.find(u => u.email === email.toLowerCase());
    if (!user) {
      return res.status(401).json({
        message: 'Credențiale greșite'
      });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({
        message: 'Credențiale greșite'
      });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (err) {
    res.status(500).json({
      message: 'Eroare la login',
      error: err.message
    });
  }
});

// =======================
// RUTĂ PROTEJATĂ
// =======================
app.get('/api/me', auth, (req, res) => {
  res.json({
    message: 'Ești logat ok',
    user: req.user
  });
});

// =======================
// TEST RANDOM (20 întrebări, doar categoria cerută)
// =======================
app.get('/api/test', (req, res) => {
  const category = String(req.query.category || 'B').trim();

  const all = getQuestionsByCategory(category);
  if (!all) {
    return res.status(400).json({ message: 'Categorie invalidă (A/B/C/D/Tr)' });
  }

  const withImg = all.filter(q => q.hasImage);
  const noImg = all.filter(q => !q.hasImage);

  const total = 20;
  const imgCount = Math.min(withImg.length, Math.round(total * 0.25)); // ~5 din 20
  const noImgCount = total - imgCount;

  let picked = [
    ...shuffle(withImg).slice(0, imgCount),
    ...shuffle(noImg).slice(0, noImgCount)
  ];

  // dacă nu ajung 20, completează din rest
  if (picked.length < total) {
    const rest = shuffle(all.filter(q => !picked.includes(q))).slice(0, total - picked.length);
    picked = [...picked, ...rest];
  }

  picked = shuffle(picked);

  // IMPORTANT: nu trimitem correctOptionId la frontend
  const safe = picked.map(q => ({
    id: q.id,
    category: q.category,
    text: q.text,
    hasImage: q.hasImage,
    imageKey: q.imageKey,
    options: q.options.map(o => ({ id: o.id, text: o.text }))
  }));

  res.json({ category, count: safe.length, questions: safe });
});

// =======================
// SUBMIT (scor) - IMPORTANT: aici trebuie să verifici cu “corectul” din backend.
// Pentru moment păstrăm ruta ta, dar o adaptăm după ce îmi zici formatul trimis de frontend.
// =======================
app.post('/api/submit', (req, res) => {
  res.json({ message: 'OK - endpoint de submit îl legăm după ce front-end trimite answers' });
});

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
