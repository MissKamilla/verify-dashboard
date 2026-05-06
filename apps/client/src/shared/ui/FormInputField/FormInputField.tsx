import { useId, type ComponentProps, type ReactNode } from "react";

type FormFieldProps = {
  label: string;
  error?: string;
  endIcon?: ReactNode;
} & ComponentProps<"input">;

export function FormInputField({
  label,
  error,
  id,
  endIcon,
  ...inputProps
}: FormFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  const inputBorderClass = error
    ? "border-[#E95A54]"
    : "border-[#DBDADA] focus:border-[#168B6C]";
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className="text-[14px] leading-none font-medium text-[#161616]"
      >
        {label}
        {inputProps.required && <span className="text-[#E95A54]"> *</span>}
      </label>
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`h-[50px] w-full rounded-[16px] border pl-[18px] pr-12 text-[14px] font-normal text-[#161616] outline-none placeholder:text-[#A0B1A5] ${inputBorderClass}`}
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
          className="text-[12px] font-normal leading-[24px] text-[#E95A54]"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
