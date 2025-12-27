import { Children, isValidElement, useMemo, useState, forwardRef, useImperativeHandle, useRef } from "react";
import { cn } from "../utils/cn";
import QuizOption from "./QuizOption";
import QuizOptionInternal from "./QuizOptionInternal";

function indexToLetter(i) {
  if (i >= 0 && i < 26) return String.fromCharCode(65 + i); // A-Z
  return String(i + 1);
}

/**
 * QuizOptions renders QuizOption children with auto letters (A, B, C...),
 * tracks selection, and can optionally display an image alongside.
 *
 * Props:
 * - children: one or more <QuizOption id="...">...</QuizOption>
 * - multiple?: boolean (default false)
 * - value?: string | string[] (controlled)
 * - defaultValue?: string | string[] (uncontrolled)
 * - onChange?: (next: string | string[]) => void
 * - size?: 'sm' | 'md' | 'lg' (passed to QuizOption)
 * - imageSrc?: string
 * - imageAlt?: string
 * - imageClassName?: string
 * - layout?: 'stack' | 'split' (default 'split')
 * - className?: string
 * - optionsClassName?: string
 * - optionClassName?: string
 * 
 * Exposed via ref:
 * - getValue(): string | string[] | null - Get current selected value(s)
 * - setValue(value: string | string[]): void - Set selected value(s) programmatically
 * - value: string | string[] | null - Direct access to current value
 */
const QuizOptions = forwardRef(function QuizOptions({
  children,
  multiple = false,
  value,
  defaultValue,
  onChange,
  size = "lg",
  imageSrc,
  imageAlt = "",
  imageClassName,
  layout = "split",
  className,
  optionsClassName,
  optionClassName,
}, ref) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(() => {
    if (defaultValue !== undefined) return defaultValue;
    return multiple ? [] : null;
  });

  const selected = isControlled ? value : internalValue;

  // Expose internal value and methods via ref
  useImperativeHandle(ref, () => ({
    getValue: () => selected,
    setValue: (newValue) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      if (typeof onChange === "function") {
        onChange(newValue);
      }
    },
    value: selected,
    // Access isSelected state of individual options
    getOptionIsSelected: (optionId) => {
      return optionRefs.current[optionId]?.isSelected ?? false;
    },
    // Get all option refs
    getOptionRefs: () => optionRefs.current,
  }), [selected, isControlled, onChange]);

  const selectedSet = useMemo(() => {
    return new Set(Array.isArray(selected) ? selected : []);
  }, [selected]);

  function commit(next) {
    if (!isControlled) setInternalValue(next);
    if (typeof onChange === "function") onChange(next);
  }

  function setAsSelected(id) {
    if (multiple) {
      const nextSet = new Set(selectedSet);
      nextSet.add(id);
      commit(Array.from(nextSet));
      return;
    }
    commit([id]);
  }

  const showImage = Boolean(imageSrc);
  const optionChildren = useMemo(
    () =>
      Children.toArray(children).filter(
        (child) => isValidElement(child) && child.type === QuizOption
      ),
    [children]
  );

  // Store refs to all QuizOptionInternal components to access their isSelected state
  const optionRefs = useRef({});

  return (
    <div
      className={cn(
        "w-full",
        layout === "split" ? "grid gap-6 md:grid-cols-2 items-start" : "flex flex-col gap-6",
        className
      )}
    >
      {showImage && (
        <div className="flex justify-center md:justify-end order-1 md:order-2">
          <img
            src={imageSrc}
            alt={imageAlt}
            className={cn(
              "max-w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/30",
              imageClassName
            )}
          />
        </div>
      )}

      <div className={cn("flex flex-col items-center gap-4 order-2 md:order-1", optionsClassName)}>
        {optionChildren.map((child, idx) => {
          const optionId =
            child.props?.id ?? child.props?.value ?? child.props?.["option-id"] ?? `option-${idx}`;
          const childOnSelect = child.props?.onSelect;

          return (
            <QuizOptionInternal
              // Use the child's own key if it has one; otherwise fall back to id.
              key={child.key ?? optionId}
              ref={(el) => {
                if (el) optionRefs.current[optionId] = el;
              }}
              {...child.props}
              letter={indexToLetter(idx)}
              size={child.props?.size ?? size}
              selected={selectedSet.has(optionId)}
              onSelect={() => {
                setAsSelected(optionId);
                if (typeof childOnSelect === "function") childOnSelect();
              }}
              className={cn(child.props?.className, optionClassName)}
            >
              {child.props?.children}
            </QuizOptionInternal>
          );
        })}
      </div>
    </div>
  );
});

export default QuizOptions;