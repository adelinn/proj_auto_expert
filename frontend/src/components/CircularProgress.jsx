import { useId } from 'react';

/**
 * Circular progress indicator component
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} size - Size variant: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} className - Additional Tailwind classes
 * @param {React.ReactNode} children - Optional content to display inside the circle (defaults to percentage)
 */
export default function CircularProgress({ 
  progress = 0, 
  size = 'md',
  className = '',
  children 
}) {
  const gradientId = useId();
  // Size variants
  const sizeConfig = {
    sm: {
      svg: 32,
      center: 16,
      radius: 12,
      strokeWidth: 4,
      textSize: 'text-[10px]'
    },
    md: {
      svg: 48,
      center: 24,
      radius: 20,
      strokeWidth: 6,
      textSize: 'text-xs'
    },
    lg: {
      svg: 64,
      center: 32,
      radius: 28,
      strokeWidth: 8,
      textSize: 'text-sm'
    }
  };

  const config = sizeConfig[size];
  const circumference = 2 * Math.PI * config.radius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg 
        className="transform -rotate-90" 
        width={config.svg} 
        height={config.svg}
        viewBox={`0 0 ${config.svg} ${config.svg}`}
      >
        {/* Background circle */}
        <circle
          cx={config.center}
          cy={config.center}
          r={config.radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={config.strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={config.center}
          cy={config.center}
          r={config.radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300"
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      {/* Content inside circle */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children !== undefined ? (
          children
        ) : (
          <span className={`${config.textSize} font-semibold text-white/90`}>
            {Math.round(progress)}%
          </span>
        )}
      </div>
    </div>
  );
}

