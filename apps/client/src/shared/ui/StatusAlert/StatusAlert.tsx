import {
  useCallback,
  useEffect,
  useRef,
  type MouseEventHandler,
  type ReactNode,
} from "react";

import checkIconUrl from "@/assets/icons/check.svg";
import closeIconUrl from "@/assets/icons/close.svg";

import { Icon } from "@/shared/ui/Icon";

type StatusAlertVariant = "success" | "error" | "warning";

type StatusAlertProps = {
  variant: StatusAlertVariant;
  title: string;
  children: ReactNode;
  onClose?: () => void;
  autoCloseMs?: number;
  tooltipText?: string;
  className?: string;
};

const variantClassNames: Record<StatusAlertVariant, string> = {
  success: "border-avatar bg-alert-success-bg text-text-main before:bg-avatar",
  error: "border-error bg-alert-error-bg text-text-main before:bg-error",
  warning:
    "border-alert-warning bg-alert-warning-bg text-text-main before:bg-alert-warning",
};

const iconClassNames: Record<StatusAlertVariant, string> = {
  success: "bg-brand text-white",
  error: "bg-error text-white",
  warning: "bg-alert-warning text-text-main",
};

export function StatusAlert({
  variant,
  title,
  children,
  onClose,
  autoCloseMs,
  tooltipText,
  className = "",
}: StatusAlertProps) {
  const role = variant === "error" ? "alert" : "status";

  const timeoutIdRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const remainingMsRef = useRef(autoCloseMs ?? 0);

  const clearAutoCloseTimeout = useCallback(() => {
    if (timeoutIdRef.current) {
      window.clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, []);

  const startAutoCloseTimeout = useCallback(
    (delayMs: number) => {
      if (!onClose || !autoCloseMs) {
        return;
      }

      clearAutoCloseTimeout();

      startedAtRef.current = Date.now();
      timeoutIdRef.current = window.setTimeout(() => {
        onClose();
      }, delayMs);
    },
    [autoCloseMs, clearAutoCloseTimeout, onClose],
  );

  const handleMouseEnter: MouseEventHandler<HTMLDivElement> = () => {
    if (!autoCloseMs || !timeoutIdRef.current) {
      return;
    }

    const elapsedMs = Date.now() - startedAtRef.current;
    remainingMsRef.current = Math.max(0, remainingMsRef.current - elapsedMs);

    clearAutoCloseTimeout();
  };

  const handleMouseLeave: MouseEventHandler<HTMLDivElement> = () => {
    if (!autoCloseMs || !remainingMsRef.current) {
      return;
    }

    startAutoCloseTimeout(remainingMsRef.current);
  };

  useEffect(() => {
    if (!autoCloseMs || !onClose) {
      return;
    }

    remainingMsRef.current = autoCloseMs;
    startAutoCloseTimeout(autoCloseMs);

    return clearAutoCloseTimeout;
  }, [autoCloseMs, clearAutoCloseTimeout, onClose, startAutoCloseTimeout]);

  return (
    <div
      role={role}
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative flex h-[60px] w-full items-center gap-[14px] overflow-hidden rounded-lg border py-4 pr-[18px] pl-6 text-base leading-normal before:absolute before:top-0 before:left-0 before:h-full before:w-[8px] ${variantClassNames[variant]} ${className}`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${iconClassNames[variant]}`}
      >
        {variant === "success" ? (
          <Icon src={checkIconUrl} className="h-3 w-3 text-current" />
        ) : variant === "error" ? (
          <Icon src={closeIconUrl} className="h-[10px] w-[10px] text-current" />
        ) : (
          <span className="text-base font-bold leading-none">!</span>
        )}
      </span>

      <p className="min-w-0 flex-1 truncate" title={tooltipText}>
        <span className="font-bold">{title}.</span>{" "}
        <span className="font-normal">{children}</span>
      </p>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center text-text-main hover:text-brand"
          aria-label="Close alert"
        >
          <Icon src={closeIconUrl} className="h-[14px] w-[14px] text-current" />
        </button>
      )}
    </div>
  );
}
