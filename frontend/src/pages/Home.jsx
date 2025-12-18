import Button from "../components/Button";
import Pin from "../components/Pin";
import QuizOption from "../components/QuizOption";

function Home() {
  return (
    <section className="-mt-8 relative">
      {/* Content with relative positioning */}
      <div className="relative z-10">
        <h1>Întrebare rapidă...</h1>
        <div>
          <div>
            <QuizOption className="m-5">Weeeeeeeeeeeeee.</QuizOption>
            <QuizOption className="m-5" size="sm">
              Weeeeeeeeeeeeee.
            </QuizOption>
            <QuizOption className="m-5" size="lg">
              Weeeeeeeeeeeeee.
            </QuizOption>
          </div>
          <div>
            <img src="" alt="" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;
