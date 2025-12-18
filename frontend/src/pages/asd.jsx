import Button from "../components/Button";
import Pin from "../components/Pin";
import QuizOption from "../components/QuizOption";
import QuizOptions from "../components/QuizOptions";

export default function Questions() {
  return (
    <section className="-mt-8 relative">
      {/* Content with relative positioning */}
      <div className="relative z-10">
        <h1>Întrebare rapidă...</h1>
        <QuizOptions size="lg" imageSrc="" imageAlt="">
          <QuizOption id="opt-a">Weeeeeeeeeeeeee.</QuizOption>
          <QuizOption id="opt-b">Weeeeeeeeeeeeee.</QuizOption>
          <QuizOption id="opt-c">Weeeeeeeeeeeeee.</QuizOption>
        </QuizOptions>
      </div>
    </section>
  );
}
