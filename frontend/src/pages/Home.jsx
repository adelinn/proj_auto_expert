import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utils/token';
import Spinner from '../components/Spinner';
import './Home.css';

const API_BASE_URL = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:5000/api";

function Home() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch quizzes from backend
  useEffect(() => {
    async function fetchQuizzes() {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = getToken();
        if (!token) {
          setError('Nu sunteți autentificat');
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/chestionare`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError('Sesiunea a expirat. Vă rugăm să vă autentificați din nou.');
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setQuizzes(data || []);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError('Eroare la încărcarea chestionarelor. Vă rugăm să reîncercați.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuizzes();
  }, []);

  function openQuiz(id) {
    navigate(`/quiz/${id}`);
  }

  async function startNewAttempt() {
    try {
      setIsCreating(true);
      
      const token = getToken();
      if (!token) {
        alert('Nu sunteți autentificat');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/chestionare`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('Sesiunea a expirat. Vă rugăm să vă autentificați din nou.');
          navigate('/login');
          return;
        }
        
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.msg || 'Eroare la crearea chestionarului nou';
        alert(errorMsg);
        return;
      }

      const newQuiz = await response.json();
      navigate(`/quiz/${newQuiz.id}`);
    } catch (err) {
      console.error('Error creating new quiz:', err);
      alert('Eroare la crearea chestionarului nou. Vă rugăm să reîncercați.');
    } finally {
      setIsCreating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="home-page">
        <header className="home-header">
          <h1 className="page-title">Chestionare</h1>
          <p className="page-subtitle">Se încarcă...</p>
        </header>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <header className="home-header">
          <h1 className="page-title">Chestionare</h1>
          <p className="page-subtitle">Eroare</p>
        </header>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-white/80 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/90 transition-colors"
            >
              Reîncearcă
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <h1 className="page-title">Chestionare</h1>
        <p className="page-subtitle">Selectează un test pentru a începe sau continua</p>
      </header>

      <div className="grid">
        {quizzes.map((q, idx) => {
          // Use backend data for progress
          const completed = q.nr_raspunse || 0;
          const correct = q.nr_corecte || 0;
          const wrong = completed - correct;
          const totalQuestions = q.nr_intrebari || 0;
          const percent = totalQuestions > 0 ? Math.round((completed / totalQuestions) * 100) : 0;
          const ctaLabel = completed > 0 ? 'Continuă' : 'Începe';

          return (
            <div 
              key={q.id} 
              className="card glass-card compact cursor-pointer" 
              onClick={() => openQuiz(q.id)}
              role="button" 
              tabIndex={"0"}
              aria-label={`Deschide chestionar: ${q.nume || `Chestionar ${idx + 1}`}`}
            >
              <div
                className="badge"
                role="status"
                aria-label={`${completed} din ${totalQuestions} întrebări, ${percent}% completat`}
              >
                <svg className="badge-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 2a10 10 0 1 0 10 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 12V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="badge-text">
                  <div className="badge-count">{completed}/{totalQuestions}</div>
                  <div className="badge-percent">{percent}%</div>
                </div>
              </div>

              <h3 className="card-title">{q.nume || `Chestionar ${idx + 1}`}</h3>
              <div className="card-score">✅ {correct} &nbsp; ❌ {wrong}</div>
              <div className="cta"><div className="btn-primary small">{ctaLabel}</div></div>
            </div>
          );
        })}

        {/* Special new quiz card last */}
        <div 
          className="card glass-card new-card" 
          onClick={isCreating ? undefined : startNewAttempt}
          role="button" 
          tabIndex={isCreating ? "-1" : "0"}
          aria-disabled={isCreating}
          aria-label="Creează chestionar nou"
          style={{ opacity: isCreating ? 0.6 : 1, cursor: isCreating ? 'wait' : 'pointer' }}
        >
          <div className="new-icon" aria-hidden>
            {isCreating ? <Spinner size="sm" /> : '➕'}
          </div>
          <h3 className="card-title">Chestionar nou</h3>
          <div className="meta">Începe un test nou din această categorie</div>
          <div className="cta">
            <div className="btn-primary small">{isCreating ? 'Se creează...' : 'Începe'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
