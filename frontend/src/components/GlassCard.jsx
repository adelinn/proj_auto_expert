import { cn } from "../utils/cn";

/**
 * Reusable glass card component with Tailwind CSS
 * @param {React.ReactNode} children - Card content
 * @param {string} variant - Card variant: 'default' | 'compact' (default: 'default')
 * @param {Function} onClick - Click handler
 * @param {string} className - Additional Tailwind classes
 * @param {object} props - Other HTML div props
 */
export default function GlassCard({
  children,
  variant = 'default',
  onClick,
  className,
  ...props
}) {
  const baseClasses = cn(
    // Glass effect
    "relative bg-gradient-to-b from-white/[0.025] to-[rgba(8,10,14,0.48)]",
    "backdrop-blur-xl border border-white/[0.04]",
    "shadow-[0_20px_60px_rgba(2,6,23,0.65)]",
    "transition-all duration-160 ease-out",
    "flex flex-col items-center justify-center text-center gap-2",
    // Variant-specific padding
    variant === 'compact' && "p-3.5",
    variant === 'default' && "p-4",
    // Clickable styles
    onClick !== undefined && "cursor-pointer",
    onClick !== undefined && "hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(2,6,23,0.72)]",
    // Base styles
    "rounded-xl",
    className
  );

  return (
    <div
      className={baseClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

