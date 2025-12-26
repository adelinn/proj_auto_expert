import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getToken } from '../utils/token';
import Spinner from '../components/Spinner';
import ChooseCategoryModal from '../components/ChooseCategoryModal';
import CircularProgress from "../components/CircularProgress";
import GlassCard from '../components/GlassCard';
import './Home.css';
import { PlusIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/16/solid';

const API_BASE_URL = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:5000/api";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Check if category is needed on mount or when redirected
  useEffect(() => {
    const category = localStorage.getItem('userCategory');
    const shouldOpenModal = 
      !category || 
      (location.state && location.state.openCategory);
    
    if (shouldOpenModal) {
      setIsCategoryModalOpen(true);
    }
  }, [location]);

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

      // Get selected category from localStorage
      const category = localStorage.getItem('userCategory');

      const response = await fetch(`${API_BASE_URL}/chestionare`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(category && { categorie: category })
        }),
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
      <ChooseCategoryModal 
        open={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)} 
      />
      
      <header className="home-header">
        <h1 className="page-title">Chestionare</h1>
        <p className="page-subtitle">Selectează un test pentru a începe sau continua</p>
      </header>

      <div className="grid grid-cols-[repeat(auto-fill,_minmax(220px,_1fr))] max-md:grid-cols-2 gap-2">
        {quizzes.map((q, idx) => {
          // Use backend data for progress
          const completed = q.nr_raspunse || 0;
          const correct = q.nr_corecte || 0;
          const wrong = completed - correct;
          const totalQuestions = q.nr_intrebari || 0;
          const percent = totalQuestions > 0 ? Math.round((completed / totalQuestions) * 100) : 0;
          const ctaLabel = completed > 0 ? 'Continuă' : 'Începe';

          return (
            <GlassCard
              key={q.id}
              variant="compact"
              onClick={() => openQuiz(q.id)}
              role="button"
              tabIndex="0"
              aria-label={`Deschide chestionar: ${q.nume || `Chestionar ${idx + 1}`}`}
            >
              <h3 className="text-base font-semibold">{q.nume || `Chestionar ${idx + 1}`}</h3>
              
              <div className="mt-2.5 inline-flex justify-center max-md:flex-wrap gap-2">
                <div
                  className="text-sm inline-flex items-center gap-2 mr-1 min-w-[58px]"
                  role="status"
                  aria-label={`${completed} din ${totalQuestions} întrebări, ${percent}% completat`}
                >
                  <CircularProgress progress={totalQuestions > 0 ? Math.round((completed / totalQuestions) * 100) : 0} size="sm" > </CircularProgress>
                  <div className="flex flex-col items-start">
                    <div>{completed}/{totalQuestions}</div>
                    <div className="font-bold text-[#bff3f6]">{percent}%</div>
                  </div>
                  <div className="flex flex-col items-start">
                    <div className="flex flex-row items-center justify-center"><CheckCircleIcon className="size-4 mr-0.5"/>{correct}</div>
                    <div className="font-bold flex flex-row items-center justify-center"><XCircleIcon className="size-4 mr-0.5"/>{wrong}</div>
                  </div>
                </div>
                <div className="flex-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white font-bold py-1.5 px-2.5 rounded-[10px] shadow-[0_8px_24px_rgba(2,6,23,0.32)] text-sm">
                  {ctaLabel}
                </div>
              </div>
            </GlassCard>
          );
        })}

        {/* Special new quiz card last */}
        <GlassCard
          onClick={isCreating ? undefined : startNewAttempt}
          role="button"
          tabIndex={isCreating ? "-1" : "0"}
          aria-disabled={isCreating}
          aria-label="Creează chestionar nou"
          className={isCreating ? "opacity-60 cursor-wait" : ""}
        >
          <div className="text-2xl bg-emerald-500/8 text-emerald-500 w-16 h-16 inline-flex items-center justify-center rounded-lg" aria-hidden>
            {isCreating ? <Spinner size="md" /> : <PlusIcon className='size-12'/>}
          </div>
          <div className="text-sm text-white/70">Începe un test nou din această categorie</div>
        </GlassCard>
      </div>
    </div>
  );
}

export default Home;
