/**
 * Utility function to merge Tailwind CSS classes
 * Combines class names and handles conflicts
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

