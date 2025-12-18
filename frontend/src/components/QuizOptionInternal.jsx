import { Button as Btn } from "@headlessui/react";
import { useState } from "react";
import { cn } from "../utils/cn";

/**
 * Reusable Button component with configurable styling
 * @param {React.ReactNode} children - Button text content
 * @param {string} letter - Option letter: an alphabet character (default: 'A')
 * @param {string} size - Size variant: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} borderRadius - Border radius Tailwind class (default: 'rounded-md')
 * @param {boolean} selected - Whether the current option is selected.
 * @param {Function} onSelect - Action to be triggered when item is selected
 * @param {string} className - Additional Tailwind classes
 * @param {object} props - Other Headless UI Button props
 */
function QuizOption({
  children,
  letter = "A",
  size = "md",
  borderRadius = "rounded-md",
  selected,
  onSelect,
  className,
  ...props
}) {
  let [isSelected, setIsSelected] = useState(typeof selected === "boolean" ? selected : false);

  function activate() {
    if (typeof onSelect === "function") onSelect();
    setIsSelected(true);
  }
  // Size variants for padding
  const sizeVariantLetterClasses = {
    sm: "px-2 py-1.5",
    md: "px-2 py-1.5",
    lg: "px-3 py-2",
  };
  // Size variants for text
  const textSizeVariantClasses = {
    sm: "text-xs",
    md: "text-base",
    lg: "text-2xl",
  };
  const textSizeClasses = {
    sm: "text-sm/6",
    md: "text-base",
    lg: "text-xl",
  };

  // Base classes
  const baseClassesButton =
    "inline-flex items-center gap-2 bg-beige-700/10 backdrop-blur-md font-semibold text-white shadow-inner shadow-white/10 border border-white/20 data-hover:bg-beige-600/15 data-open:bg-beige-700/15 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white";
  const baseClasses =
    "w-full max-w-md rounded-xl bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0";

  // Combine all classes
  const cardClasses = cn(baseClasses, className);
  const buttonClasses = cn(baseClassesButton, textSizeVariantClasses[size], sizeVariantLetterClasses[size], borderRadius);

  return (
    <div className="relative z-10" {...props}>
      <div
        className={cn(cardClasses, "inline-flex items-center gap-4")}
      >
        <div className="shrink-0">
          <Btn
            className={cn(
              buttonClasses,
              "font-bold leading-none",
              isSelected ? "ring-2 ring-white/60" : false
            )}
            onClick={activate}
          >
            {letter[0].toLocalUpperCase()}
          </Btn>
        </div>
        <p
          className={cn(
            textSizeClasses[size],
            "m-0 text-left leading-snug text-white/70"
          )}
        >
          {children}
        </p>
      </div>
    </div>
  );
}

export default QuizOption;
