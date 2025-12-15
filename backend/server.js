require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const questions = require("./questions");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// "baza de date" temporară (în memorie)
const users = [];

// Middleware JWT (pentru rute protejate)
function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ message: "Lipsește token-ul (Authorization: Bearer ...)" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Token invalid sau expirat" });
  }
}

// Test backend
app.get("/", (req, res) => {
  res.send("Backend funcționează ok");
});

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email și parolă obligatorii" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Parola minim 6 caractere" });
    }

    const exists = users.find((u) => u.email === email.toLowerCase());
    if (exists) {
      return res.status(409).json({ message: "Email deja folosit" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
      id: users.length + 1,
      email: email.toLowerCase(),
      passwordHash,
      name: name || ""
    };

    users.push(user);

    res.status(201).json({
      message: "User creat ✅",
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err) {
    res.status(500).json({ message: "Eroare la register", error: err.message });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email și parolă obligatorii" });
    }

    const user = users.find((u) => u.email === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ message: "Credențiale greșite" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Credențiale greșite" });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err) {
    res.status(500).json({ message: "Eroare la login", error: err.message });
  }
});

// Rută protejată (test)
app.get("/api/me", auth, (req, res) => {
  res.json({ message: "Ești logat ok", user: req.user });
});

// Rutele tale existente
app.get("/api/questions", (req, res) => {
  res.json(questions);
});

app.post("/api/submit", (req, res) => {
  const userAnswers = req.body.answers;

  let total = questions.length;
  let correct = 0;

  questions.forEach((q) => {
    if (userAnswers[q.id] === q.correctOptionId) {
      correct++;
    }
  });

  res.json({
    total,
    correct,
    scorePercent: Math.round((correct / total) * 100)
  });
});

app.listen(PORT, () => {
  console.log(`Backend-ul rulează pe http://localhost:${PORT}`);
});
