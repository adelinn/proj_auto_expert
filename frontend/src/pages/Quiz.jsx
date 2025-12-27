import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QuizOption from "../components/QuizOption";
import QuizOptions from "../components/QuizOptions";
import Spinner from "../components/Spinner";
import Pin from "../components/Pin";
import CircularProgress from "../components/CircularProgress";
import { getToken } from "../utils/token";
import { ArrowUturnRightIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/16/solid";

const API_BASE_URL =
  import.meta?.env?.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const pinsContainerRef = useRef(null);
  const pinRefs = useRef({});

  // Fetch quiz data from backend
  useEffect(() => {
    async function fetchQuiz() {
      try {
        setIsLoading(true);
        setError(null);

        const token = getToken();
        if (!token) {
          setError("Nu sunteți autentificat");
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/chestionar/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError(
              "Sesiunea a expirat. Vă rugăm să vă autentificați din nou."
            );
            return;
          }
          if (response.status === 404) {
            setError("Chestionarul nu a fost găsit");
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setQuizData(data);

        // Initialize selected answers from backend (already answered questions)
        const initialSelected = {};
        data.intrebari.forEach((intrebare) => {
          if (
            intrebare.raspunsuri_date &&
            intrebare.raspunsuri_date.length > 0
          ) {
            initialSelected[intrebare.id] = intrebare.raspunsuri_date;
          }
        });
        setSelectedAnswers(initialSelected);
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError(
          "Eroare la încărcarea chestionarului. Vă rugăm să reîncercați."
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchQuiz();
    } else {
      setIsLoading(false);
    }
  }, [id]);

  // Update document title when quizData changes and re-track page view with updated title
  useEffect(() => {
    if (quizData?.nume) {
      const newTitle = `Chestionar - ${quizData.nume}`;
      document.title = newTitle;
    }
  }, [quizData]);

  // Handle answer submission
  async function handleSubmitAnswer(intrebareId, raspunsuriIds) {
    if (
      !raspunsuriIds ||
      (Array.isArray(raspunsuriIds) && raspunsuriIds.length === 0)
    ) {
      return; // No answer selected
    }

    try {
      setIsSubmitting(true);

      const token = getToken();
      if (!token) {
        alert("Nu sunteți autentificat");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/chestionar/${id}/intrebare/${intrebareId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            raspunsuri: Array.isArray(raspunsuriIds)
              ? raspunsuriIds
              : [raspunsuriIds],
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          alert("Sesiunea a expirat. Vă rugăm să vă autentificați din nou.");
          navigate("/login");
          return;
        }

        const errorData = await response.json().catch(() => ({}));
        alert(errorData.msg || "Eroare la salvarea răspunsului");
        return;
      }

      const result = await response.json();

      // Update quiz data with new score
      if (quizData) {
        setQuizData({
          ...quizData,
          scor_curent: result.scor_total,
        });
      }

      // Update selected answers
      setSelectedAnswers((prev) => ({
        ...prev,
        [intrebareId]: Array.isArray(raspunsuriIds)
          ? raspunsuriIds
          : [raspunsuriIds],
      }));
    } catch (err) {
      console.error("Error submitting answer:", err);
      alert("Eroare la salvarea răspunsului. Vă rugăm să reîncercați.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle answer selection
  function handleAnswerChange(intrebareId, answerIds) {
    setSelectedAnswers((prev) => ({
      ...prev,
      [intrebareId]: Array.isArray(answerIds) ? answerIds : [answerIds],
    }));
  }

  // Scroll to center the current question's pin
  useEffect(() => {
    if (!pinsContainerRef.current || !quizData) return;

    const currentPin = pinRefs.current[currentQuestionIndex];
    if (!currentPin) return;

    const container = pinsContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const pinRect = currentPin.getBoundingClientRect();

    // Calculate scroll position to center the pin
    const scrollLeft =
      currentPin.offsetLeft -
      containerRect.width / 2 +
      pinRect.width / 2;

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: 'smooth',
      });
    });
  }, [currentQuestionIndex, quizData]);

  // Navigation functions
  function goToNext() {
    if (quizData && currentQuestionIndex < quizData.intrebari.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }

  function goToQuestion(index) {
    if (quizData && index >= 0 && index < quizData.intrebari.length) {
      setCurrentQuestionIndex(index);
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <section className="-mt-8 relative">
        <div className="relative z-10 color-beige-100 p-2">
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner size="lg" />
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="-mt-8 relative">
        <div className="relative z-10 color-beige-100 p-2">
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <h2 className="text-2xl font-bold mb-4">Eroare</h2>
            <p className="text-white/80 mb-4">{error}</p>
            <button
              onClick={() => navigate("/home")}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/90 transition-colors"
            >
              Înapoi la chestionare
            </button>
          </div>
        </div>
      </section>
    );
  }

  // No quiz data
  if (!quizData) {
    return (
      <section className="-mt-8 relative">
        <div className="relative z-10 color-beige-100 p-2">
          <div style={{ padding: "2rem" }}>
            <h2>Chestionar inexistent</h2>
            <p>Nu am găsit chestionarul solicitat.</p>
            <button
              onClick={() => navigate("/home")}
              style={{ marginTop: "1rem" }}
            >
              Înapoi la chestionare
            </button>
          </div>
        </div>
      </section>
    );
  }

  const currentQuestion = quizData.intrebari[currentQuestionIndex];
  const totalQuestions = quizData.intrebari.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progress =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // Helper function to check if an answer is correct
  function isAnswerCorrect(intrebare) {
    if (!intrebare.raspunsuri_date || intrebare.raspunsuri_date.length === 0) {
      return null; // Not answered
    }

    // Get correct answer IDs from variants
    const correctAnswerIds = intrebare.variante
      .filter(v => v.corect === 1)
      .map(v => v.id);

    // Get selected answer IDs
    const selectedIds = intrebare.raspunsuri_date;

    // Check if all selected are correct and all correct are selected
    const allSelectedAreCorrect = selectedIds.every(id => correctAnswerIds.includes(id));
    const allCorrectAreSelected = correctAnswerIds.every(id => selectedIds.includes(id));
    const correctCount = selectedIds.length === correctAnswerIds.length;

    return allSelectedAreCorrect && allCorrectAreSelected && correctCount;
  }

  return (
    <section className="relative -mb-6">
      <div className="relative z-10 color-beige-100 p-2">
        {/* Header with progress */}
        <div className="mb-0 max-md:mb-2">
          <div className="relative">
            <div
              ref={pinsContainerRef}
              className="flex gap-2 justify-start overflow-x-auto scrollbar-hide mb-6 pb-2 snap-x snap-mandatory"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent',
              }}
            >
              <div className="inline-flex items-center gap-2 select-none justify-center">
                <span className="size-4 text-white/70">&nbsp;</span>
              </div>
              {quizData.intrebari.map((_, index) => {
                const intrebare = quizData.intrebari[index];
                const isAnswered = selectedAnswers[intrebare.id];
                const answerCorrect = isAnswerCorrect(intrebare);
                
                let pinColorClass = "bg-white/10 hover:bg-white/20 text-white/70";
                if (index === currentQuestionIndex) {
                  pinColorClass = "bg-blue-500 text-white";
                } else if (isAnswered) {
                  // Show red for wrong answers, green for correct answers
                  pinColorClass = answerCorrect 
                    ? "bg-junglegreen-500/50 text-white" 
                    : "bg-racingred-500/50 text-white";
                }

                return (
                  <Pin
                    key={index}
                    ref={(el) => {
                      if (el) pinRefs.current[index] = el;
                    }}
                    tabIndex={isSubmitting ? "-1" : "0"}
                    onClick={() => !isSubmitting && goToQuestion(index)}
                    aria-disabled={isSubmitting}
                    className={`transition-colors flex-shrink-0 snap-center ${pinColorClass}`}
                    title={`Întrebarea ${index + 1}`}
                  >
                    {index + 1}
                  </Pin>
                );
              })}
              <div className="inline-flex items-center gap-2 select-none justify-center">
                <span className="size-4 text-white/70">&nbsp;</span>
              </div>
            </div>
            
            {/* Left fade overlay */}
            <div 
              className="absolute backdrop-blur-xl -left-6 -top-8 -bottom-6 w-12 pointer-events-none z-10"
              style={{
                maskImage: 'radial-gradient(at center, black 25%, transparent 70%)',
                WebkitMaskImage: '-webkit-radial-gradient(center, black 25%, transparent 70%)',
                MozMaskImage: 'radial-gradient(at center, black 25%, transparent 70%)',
              }}
            />
            
            {/* Right fade overlay */}
            <div 
              className="absolute backdrop-blur-xl -right-6 -top-8 -bottom-6 w-12 pointer-events-none z-10"
              style={{
                maskImage: 'radial-gradient(at center, black 25%, transparent 70%)',
                WebkitMaskImage: '-webkit-radial-gradient(center, black 25%, transparent 70%)',
                MozMaskImage: 'radial-gradient(at center, black 25%, transparent 70%)',
              }}
            />
          </div>

          <div className="flex items-center justify-between mb-0">
            <h1 className="text-md text-left font-bold">{quizData.nume}</h1>
            <CircularProgress progress={progress} size="md" />
          </div>
        </div>

        {/* Current question */}
        {currentQuestion && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {currentQuestion.text}
            </h2>

            <QuizOptions
              size="md"
              imageSrc={currentQuestion.poza_url || ""}
              imageAlt="Întrebare"
              // We default to true for now to be consistent with official tester behavior
              multiple={true /*currentQuestion.tip_multiplu*/}
              value={
                selectedAnswers[currentQuestion.id] ||
                (currentQuestion.tip_multiplu ? [] : null)
              }
              onChange={(answerIds) =>
                handleAnswerChange(currentQuestion.id, answerIds)
              }
            >
              {currentQuestion.variante.map((varianta) => (
                <QuizOption key={varianta.id} option-id={varianta.id}>
                  {varianta.text}
                </QuizOption>
              ))}
            </QuizOptions>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-center gap-4 mt-6 pb-4">
          <button
            onClick={() => {
              // Answer later - just move to next question
              goToNext();
            }}
            disabled={currentQuestionIndex === totalQuestions - 1 || isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white/90 transition-colors"
          >
            <ArrowUturnRightIcon className="size-5"/><span className="max-md:text-xs">Răspunde mai târziu</span>
          </button>
          
          <button
            onClick={() => {
              // Modify answer - clear current selection and allow re-selection
              if (currentQuestion) {
                setSelectedAnswers((prev) => {
                  const updated = { ...prev };
                  delete updated[currentQuestion.id];
                  return updated;
                });
              }
            }}
            disabled={!selectedAnswers[currentQuestion?.id] || isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-racingred-700/60 hover:bg-racingred-700/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white/90 transition-colors"
          >
            <XCircleIcon className="size-5"/><span className="max-md:hidden">Modifică răspunsul</span>
          </button>
          
          <button
            onClick={() => {
              // Submit answer - same as auto-submit but explicit
              if (currentQuestion && selectedAnswers[currentQuestion.id]) {
                handleSubmitAnswer(
                  currentQuestion.id,
                  selectedAnswers[currentQuestion.id]
                );
                goToNext();
              }
            }}
            disabled={!selectedAnswers[currentQuestion?.id] || isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-all shadow-lg shadow-blue-500/20"
          >
            <CheckCircleIcon className="size-5"/><span className="max-md:hidden">Trimite răspunsul</span>
          </button>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate("/home")}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/90 transition-colors"
        >
          Înapoi la chestionare
        </button>

        <div className="flex items-center gap-4 mt-2">
          <div className="text-xs text-white/60 flex-1">
            {answeredCount} din {totalQuestions} întrebări răspunse • Scor:{" "}
            {quizData.scor_curent || 0}
          </div>
        </div>

        {isSubmitting && (
          <div className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-xl rounded-lg px-4 py-2 flex items-center gap-2">
            <Spinner size="sm" />
            <span className="text-sm text-white/90">Se salvează...</span>
          </div>
        )}
      </div>
    </section>
  );
}
