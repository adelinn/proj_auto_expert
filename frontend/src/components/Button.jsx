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
  borderRadius = "rounded-md",
  className,
  ...props
}) {
  // Size variants for padding and text
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  // Base classes
  const baseClasses =
    "inline-flex items-center gap-2 bg-beige-700/10 backdrop-blur-md font-semibold text-beige-100/90 shadow-lg shadow-black/10 border border-white/20 data-hover:bg-beige-200/15 data-active:outline-none data-hover:data-active:bg-beige-600/15 transition-all duration-200";

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