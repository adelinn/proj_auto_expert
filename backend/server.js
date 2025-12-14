const express = require("express");
const cors = require("cors");
const questions = require("./questions");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend funcționează");
});

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
//Acie va arata apalicat în brauzer dar trebe să o conectez cu frontendul 