import { forwardRef } from "react";
import { cn } from "../utils/cn";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

/**
 * Reusable Button component with configurable styling
 * @param {React.ReactNode} children - Text content
 * @param {'check' | 'x' | 'empty'} mode - Icon position, default 'empty'
 * @param {string} size - Size variant: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} borderRadius - Border radius Tailwind class (default: 'rounded-full')
 * @param {string} className - Additional Tailwind classes
 * @param {object} props - Other Headless UI Button props
 */
const Pin = forwardRef(function Pin({
  children,
  mode = "empty",
  size = "md",
  borderRadius = "rounded-full",
  className,
  ...props
}, ref) {
  // Size variants for padding and text
  const sizeClasses = {
    sm: "px-1.5 py-1.5 text-xs",
    md: "px-2 py-2 text-sm",
    lg: "px-3 py-3 text-base",
  };
  // Size variants for icon
  const iconSizeClasses = {
    sm: "size-4",
    md: "size-5",
    lg: "size-6",
  };

  // Base classes
  const baseClasses =
    "inline-flex items-center gap-2 select-none bg-beige-700/10 backdrop-blur-md font-semibold text-beige-100/90 shadow-lg shadow-black/10 border border-white/20 data-hover:bg-beige-200/15 data-active:outline-none data-hover:data-active:bg-beige-600/15 transition-all duration-200";

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
    else return <span className={`${iconSizeClasses[size]} text-white/70`}>{children}</span>;
  };

  // Add role="button" and tabIndex if onClick is provided but not explicitly set
  const hasOnClick = props.onClick !== undefined;
  const finalProps = {
    ...props,
    ...(hasOnClick && !props.role && { role: 'button' }),
    ...(hasOnClick && props.tabIndex === undefined && { tabIndex: "0" }),
  };

  return (
    <div ref={ref} className={cn(buttonClasses, "justify-center cursor-pointer")} {...finalProps}>
      {renderIcon()}
    </div>
  );
});

export default Pin;
