import Pin from "../components/Pin";
import QuizOption from "../components/QuizOption";
import QuizOptions from "../components/QuizOptions";

export default function Questions() {
  return (
    <section className="-mt-8 relative">
      {/* Content with relative positioning */}
      <div className="relative z-10 color-beige-100 p-2">
        <Pin />
        <Pin />
        <Pin />
        <h1>Întrebare rapidă...</h1>
        <QuizOptions size="lg" imageSrc="" imageAlt="">
          <QuizOption id="opt-a">
            Aceasta este pagina de întrebări. Aici vor apărea testele pentru
            categoria selectată.
          </QuizOption>
          <QuizOption id="opt-b">Weeeeeeeeeeeeee.</QuizOption>
          <QuizOption id="opt-c">Weeeeeeeeeeeeee.</QuizOption>
        </QuizOptions>
      </div>
    </section>
  );
}
