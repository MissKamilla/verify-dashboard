import { useId, type ComponentProps, type ReactNode } from "react";

type FormFieldProps = {
  label: string;
  error?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
} & ComponentProps<"input">;

export function FormInputField({
  label,
  error,
  id,
  startIcon,
  endIcon,
  ...inputProps
}: FormFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  const inputBorderClass = error
    ? "border-error"
    : "border-border-default focus:border-brand";

  const inputPaddingClass = startIcon ? "pl-[50px]" : "pl-[18px]";
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className="text-[14px] leading-none font-medium text-text-main"
      >
        {label}
        {inputProps.required && <span className="text-error"> *</span>}
      </label>
      <div className="relative">
        {startIcon && (
          <div className="absolute left-[18px] top-1/2 flex -translate-y-1/2 items-center">
            {startIcon}
          </div>
        )}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`h-[50px] w-full rounded-[16px] border ${inputPaddingClass} pr-12 text-[14px] font-normal text-text-main outline-none placeholder:text-text-muted ${inputBorderClass}`}
          {...inputProps}
        />
        {endIcon && (
          <div className="absolute right-[18px] top-1/2 flex -translate-y-1/2 items-center">
            {endIcon}
          </div>
        )}
      </div>
      {error && (
        <p
          id={errorId}
          className="text-[12px] font-normal leading-[24px] text-error"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
