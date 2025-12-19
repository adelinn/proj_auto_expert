import Pin from "../components/Pin";
import QuizOption from "../components/QuizOption";
import QuizOptions from "../components/QuizOptions";
import { useParams, useNavigate } from "react-router-dom";
import quizzesData from "../data/quizzes";

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  if (id === "new") {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Creează chestionar nou</h1>
        <p>
          Aceasta este o pagină placeholder pentru crearea unui chestionar nou.
        </p>
        <p>Pentru demo, folosește butonul Înapoi pentru a reveni la listă.</p>
        <button onClick={() => navigate(-1)} style={{ marginTop: "1rem" }}>
          Înapoi
        </button>
      </div>
    );
  }

  const quiz = quizzesData.find((q) => q.id === id);

  if (!quiz) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Chestionar inexistent</h2>
        <p>Nu am găsit chestionarul solicitat.</p>
      </div>
    );
  }

  function simulateProgress() {
    const existing = JSON.parse(
      localStorage.getItem(`progress_${quiz.id}`) || "null"
    );
    const currentCompleted = existing?.completed ?? 0;
    const currentCorrect = existing?.correct ?? 0;
    const currentWrong = existing?.wrong ?? 0;
    const sample = {
      completed: Math.min(quiz.totalQuestions, currentCompleted + 3),
      correct: currentCorrect + 2,
      wrong: currentWrong + 1,
    };
    localStorage.setItem(`progress_${quiz.id}`, JSON.stringify(sample));
    alert(
      "Progres salvat (simulat). Revino pe pagina principală pentru a vedea sigla actualizată."
    );
  }

  return (
    <section className="-mt-8 relative">
      {/* Content with relative positioning */}
      <div className="relative z-10 color-beige-100 p-2">
        <div>
          <Pin />
          <Pin />
          <Pin />
        </div>
        <h1>Chestionar (în lucru)</h1>
        <QuizOptions size="lg" imageSrc="" imageAlt="">
          <QuizOption id="opt-a">
            Acest chestionar nu este gata încă — pagină placeholder.
          </QuizOption>
          <QuizOption id="opt-b">Weeeeeeeeeeeeee.</QuizOption>
          <QuizOption id="opt-c">Weeeeeeeeeeeeee.</QuizOption>
        </QuizOptions>
        <button onClick={simulateProgress} style={{ marginRight: 8 }}>
          Simulează progres
        </button>
        <button onClick={() => navigate(-1)} style={{ marginTop: "1rem" }}>
          Înapoi
        </button>
      </div>
    </section>
  );
}
