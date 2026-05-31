import { useEffect, useRef, useState } from "react";

export function useDebouncedValue<T>(
  value: T,
  delay: number,
  onDebouncedValueChange?: (value: T) => void,
): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const isInitialDebounceRef = useRef(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);

      if (isInitialDebounceRef.current) {
        isInitialDebounceRef.current = false;
        return;
      }

      onDebouncedValueChange?.(value);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value, delay, onDebouncedValueChange]);

  return debouncedValue;
}
