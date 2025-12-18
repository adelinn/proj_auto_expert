import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import quizzesData from '../data/quizzes';
import './Home.css';

function getSavedProgress(quizId) {
  try {
    const raw = localStorage.getItem(`progress_${quizId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse saved progress', e);
    return null;
  }
}

function Home() {
  const navigate = useNavigate();
  const [category, _setCategory] = useState(() => localStorage.getItem('userCategory'));
  const quizzes = useMemo(() => quizzesData.filter((q) => q.category === category), [category]); useState([]);

  function openQuiz(id) {
    navigate(`/quiz/${id}`);
  }

  function startNewAttempt() {
    // choose first available quiz in current category
    const available = quizzes || [];
    if (!available || available.length === 0) {
      alert('Nu există chestionare în această categorie pentru a începe.');
      return;
    }

    const quiz = available[0];
    const key = `progress_${quiz.id}`;
    const initial = { completed: 0, correct: 0, wrong: 0, startedAt: Date.now() };
    // overwrite existing progress to start a new attempt
    localStorage.setItem(key, JSON.stringify(initial));

    navigate(`/quiz/${quiz.id}`);
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <h1 className="page-title">Chestionare</h1>
        <p className="page-subtitle">Selectează un test pentru a începe sau continua</p>
      </header>

      <div className="grid">

        {quizzes.map((q, idx) => {
          const saved = getSavedProgress(q.id);
          const completed = saved?.completed ?? 0;
          const correct = saved?.correct ?? 0;
          const wrong = saved?.wrong ?? 0;
          const percent = q.totalQuestions ? Math.round((completed / q.totalQuestions) * 100) : 0;
          const ctaLabel = completed > 0 ? 'Continuă' : 'Începe';

          return (
            <div key={q.id} className="card glass-card compact" onClick={() => openQuiz(q.id)} role="button" tabIndex={0}>
              <div
                className="badge"
                role="status"
                aria-label={`${completed} din ${q.totalQuestions} întrebări, ${percent}% completat`}
              >
                <svg className="badge-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 2a10 10 0 1 0 10 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 12V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="badge-text">
                  <div className="badge-count">{completed}/{q.totalQuestions}</div>
                  <div className="badge-percent">{percent}%</div>
                </div>
              </div>

              <h3 className="card-title">Chestionar {idx + 1}</h3>
              <div className="card-score">✅ {correct} &nbsp; ❌ {wrong}</div>
              <div className="cta"><div className="btn-primary small">{ctaLabel}</div></div>
            </div>
          );
        })}

        {/* Special new quiz card last */}
        <div className="card glass-card new-card" onClick={startNewAttempt} role="button" tabIndex={0}>
          <div className="new-icon" aria-hidden>➕</div>
          <h3 className="card-title">Chestionar nou</h3>
          <div className="meta">Începe un test nou din această categorie</div>
          <div className="cta"><div className="btn-primary small">Începe</div></div>
        </div>

        {quizzes.length === 0 && (
          <div className="empty">Nu există chestionare pentru categoria selectată.</div>
        )}
      </div>
    </div>
  );
}

export default Home;
