import React, { useEffect, useState } from 'react';
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
  const [category, setCategory] = useState(() => localStorage.getItem('userCategory'));
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const filtered = quizzesData.filter((q) => q.category === category);
    setQuizzes(filtered);
  }, [category]);

  function openQuiz(id) {
    navigate(`/quiz/${id}`);
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Chestionare</h1>
        <p className="sub">Selectează un test pentru a începe sau continua</p>
      </header>

      <div className="grid">
        {/* Special new quiz card first */}
        <div className="card new-card" onClick={() => openQuiz('new')} role="button" tabIndex={0}>
          <div className="new-icon" aria-hidden>➕</div>
          <h3 className="title">Chestionar nou</h3>
          <div className="meta">Creează un chestionar nou</div>
          <div className="cta">Adaugă</div>
        </div>

        {quizzes.map((q, idx) => {
          const saved = getSavedProgress(q.id);
          const completed = saved?.completed ?? 0;
          const correct = saved?.correct ?? 0;
          const wrong = saved?.wrong ?? 0;
          const percent = q.totalQuestions ? Math.round((completed / q.totalQuestions) * 100) : 0;
          const ctaLabel = completed > 0 ? 'Continuă' : 'Începe';

          return (
            <div key={q.id} className="card" onClick={() => openQuiz(q.id)} role="button" tabIndex={0}>
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

              <h3 className="title">Chestionar {idx + 1}</h3>
              <div className="score">✅ {correct} &nbsp; ❌ {wrong}</div>
              <div className="cta">{ctaLabel}</div>
            </div>
          );
        })}

        {quizzes.length === 0 && (
          <div className="empty">Nu există chestionare pentru categoria selectată.</div>
        )}
      </div>
    </div>
  );
}

export default Home;
