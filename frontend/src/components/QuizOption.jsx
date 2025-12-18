import { Button as Btn } from "@headlessui/react";
import { useState } from "react";
import { cn } from "../utils/cn";

/**
 * Reusable Button component with configurable styling
 * @param {React.ReactNode} children - Button text content
 * @param {string} size - Size variant: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} borderRadius - Border radius Tailwind class (default: 'rounded-md')
 * @param {string} className - Additional Tailwind classes
 * @param {object} props - Other Headless UI Button props
 */
function QuizOption({
  children,
  size = "md",
  borderRadius = "rounded-md",
  className,
  ...props
}) {
  let [isActive, setIsActive] = useState(false);

  function activate() {
    setIsActive(true);
  }
  // Size variants for padding
  const sizeClasses = {
    sm: "px-2.5 py-1.5",
    md: "px-3.25 py-1.5",
    lg: "px-4 py-2",
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
  const buttonClasses = cn(baseClassesButton, textSizeVariantClasses[size], sizeClasses[size], borderRadius);

  // Render icon based on position
  const renderOptionLetter = () => {
    return "A";
  };

  return (
    <div className="relative z-10" {...props}>
      <div
        className={cn(cardClasses, "inline-flex items-center justify-center")}
      >
        <div className="mt-4">
          <Btn
            className={cn(
              buttonClasses,
              "font-bold",
              isActive ? "ring-2 ring-white/60" : false
            )}
            onClick={activate}
          >
            {renderOptionLetter}
          </Btn>
        </div>
        <p className={`mt-2 ${textSizeClasses[size]} text-white/50`}>{children}</p>
      </div>
    </div>
  );
}

export default QuizOption;
