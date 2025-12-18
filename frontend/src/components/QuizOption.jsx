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
  let [isActive, setIsActive] = useState(true);

  function activate() {
    setIsActive(true);
  }
  // Size variants for padding and text
  const sizeClasses = {
    sm: "px-1.5 py-1.5 text-xs",
    md: "px-2 py-2 text-sm",
    lg: "px-3 py-3 text-base",
  };

  // Base classes
  const baseClassesButton =
  "inline-flex items-center gap-2 bg-beige-700/10 backdrop-blur-md font-semibold text-white shadow-inner shadow-white/10 data-hover:bg-beige-600/15 data-open:bg-beige-700/15 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white";
  const baseClasses =
    "inline-flex items-center gap-2 bg-beige-700/10 backdrop-blur-md font-semibold text-white shadow-inner shadow-white/10 data-hover:bg-beige-600/15 data-open:bg-beige-700/15 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white";

  // Combine all classes
  const cardClasses = cn(
    baseClasses,
    className
  );
  const buttonClasses = cn(
    baseClassesButton,
    sizeClasses[size],
    borderRadius
  );

  // Render icon based on position
  const renderOptionLetter = () => {
    return "A";
  };

  return (
    <div className={cn(cardClasses, "relative z-10")} {...props}>
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0">
            <div className="mt-4">
              <Btn className={cn(buttonClasses, "font-bold", isActive ? "ring-2 ring-white/60" : false)} onClick={activate}>
                {renderOptionLetter}
              </Btn>
            </div>
            <p className="mt-2 text-sm/6 text-white/50">{children}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizOption;
