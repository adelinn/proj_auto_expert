import { cn } from "../utils/cn";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

/**
 * Reusable Button component with configurable styling
 * @param {React.ReactNode} children - Button text content
 * @param {'check' | 'x' | 'empty'} mode - Icon position, default 'empty'
 * @param {string} size - Size variant: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} borderRadius - Border radius Tailwind class (default: 'rounded-md')
 * @param {string} className - Additional Tailwind classes
 * @param {object} props - Other Headless UI Button props
 */
function Pin({
  mode = "empty",
  size = "md",
  borderRadius = "rounded-full",
  className,
  ...props
}) {
  // Size variants for padding and text
  const sizeClasses = {
    sm: "px-1.5 py-1.5 text-xs",
    md: "px-2 py-2 text-sm",
    lg: "px-3 py-3 text-base",
  };
  // Size variants for padding and text
  const iconSizeClasses = {
    sm: "size-4",
    md: "size-5",
    lg: "size-6",
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
    let Icon;
    switch (mode) {
      case 'check':
        Icon = CheckIcon;
        break;

      case 'x':
        Icon = XMarkIcon;
        break;
    
      case 'empty':
      default:
        Icon = null;
        break;
    }
    if (Icon != null) return <Icon className={`${iconSizeClasses[size]} text-white/70`} />;
    else return <span className={`${iconSizeClasses[size]} text-white/70`} />
  };

  return (
    <div className={cn(buttonClasses, "justify-center")} {...props}>
      {renderIcon()}
    </div>
  );
}

export default Pin;
