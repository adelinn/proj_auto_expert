import { Children, isValidElement, useMemo, useState } from "react";
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
 */
function QuizOptions({
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
}) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(() => {
    if (defaultValue !== undefined) return defaultValue;
    return multiple ? [] : null;
  });

  const selected = isControlled ? value : internalValue;

  const selectedSet = useMemo(() => {
    if (multiple) return new Set(Array.isArray(selected) ? selected : []);
    return new Set(selected ? [selected] : []);
  }, [multiple, selected]);

  function commit(next) {
    if (!isControlled) setInternalValue(next);
    if (typeof onChange === "function") onChange(next);
  }

  function toggle(id) {
    if (multiple) {
      const nextSet = new Set(selectedSet);
      if (nextSet.has(id)) nextSet.delete(id);
      else nextSet.add(id);
      commit(Array.from(nextSet));
      return;
    }
    commit(id);
  }

  const showImage = Boolean(imageSrc);
  const optionChildren = useMemo(
    () =>
      Children.toArray(children).filter(
        (child) => isValidElement(child) && child.type === QuizOption
      ),
    [children]
  );

  return (
    <div
      className={cn(
        "w-full",
        layout === "split" ? "grid gap-6 md:grid-cols-2 items-start" : "flex flex-col gap-6",
        className
      )}
    >
      <div className={cn("flex flex-col items-center gap-4", optionsClassName)}>
        {optionChildren.map((child, idx) => {
          const optionId =
            child.props?.id ?? child.props?.value ?? `option-${idx}`;
          const childOnSelect = child.props?.onSelect;

          return (
            <QuizOptionInternal
              // Use the child's own key if it has one; otherwise fall back to id.
              key={child.key ?? optionId}
              {...child.props}
              letter={indexToLetter(idx)}
              size={child.props?.size ?? size}
              selected={selectedSet.has(optionId)}
              onSelect={() => {
                toggle(optionId);
                if (typeof childOnSelect === "function") childOnSelect();
              }}
              className={cn(child.props?.className, optionClassName)}
            >
              {child.props?.children}
            </QuizOptionInternal>
          );
        })}
      </div>

      {showImage && (
        <div className="flex justify-center md:justify-end">
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
    </div>
  );
}

export default QuizOptions;


