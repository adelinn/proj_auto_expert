import { Button as Btn } from "@headlessui/react";
import { cn } from "../utils/cn";

/**
 * Reusable Button component with configurable styling
 * @param {React.ReactNode} children - Button text content
 * @param {React.ComponentType} icon - Optional icon component
 * @param {'left' | 'right'} iconPosition - Icon position, default 'right'
 * @param {string} size - Size variant: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} borderRadius - Border radius Tailwind class (default: 'rounded-md')
 * @param {string} className - Additional Tailwind classes
 * @param {object} props - Other Headless UI Button props
 */
function Button({
  children,
  icon: Icon,
  iconPosition = "right",
  size = "md",
  borderRadius = "rounded-lg",
  className,
  ...props
}) {
  // Size variants for padding and text
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-3 text-sm",
    lg: "px-6 py-3 text-base",
  };

  // Base classes — accent primary button
  const baseClasses =
    "inline-flex items-center justify-center w-full gap-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-400 text-white font-bold shadow-lg shadow-black/25 border border-transparent hover:brightness-105 hover:shadow-[0_14px_40px_rgba(59,130,246,0.18)] focus:ring-4 focus:ring-[rgba(59,130,246,0.12)] focus:outline-none data-hover:bg-beige-200/15 data-focus:outline-offset-2 transition-all duration-200";

  // Combine all classes
  const buttonClasses = cn(
    baseClasses,
    sizeClasses[size],
    borderRadius,
    className
  );

  // Render icon based on position
  const renderIcon = () => {
    if (!Icon) return null;
    return <Icon className="size-4 text-white/70" />;
  };

  return (
    <Btn className={buttonClasses} {...props}>
      {iconPosition === "left" && renderIcon()}
      {children}
      {iconPosition === "right" && renderIcon()}
    </Btn>
  );
}

export default Button;