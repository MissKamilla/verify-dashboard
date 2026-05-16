import { useId, type ComponentProps, type ReactNode } from "react";

type FormTextareaFieldProps = {
  label: ReactNode;
  error?: string;
} & ComponentProps<"textarea">;

export function FormTextareaField({
  label,
  error,
  id,
  ...textareaProps
}: FormTextareaFieldProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = `${textareaId}-error`;

  const textareaBorderClass = error
    ? "border-error"
    : "border-border-default focus:border-brand";

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={textareaId}
        className="text-[14px] font-medium leading-none text-text-main"
      >
        {label}
        {textareaProps.required && <span className="text-error"> *</span>}
      </label>

      <textarea
        id={textareaId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`min-h-[100px] w-full resize-none rounded-[16px] border px-[18px] py-[16px] text-[14px] font-normal leading-[150%] text-text-main outline-none placeholder:text-text-muted  lg:min-h-[114px] ${textareaBorderClass}`}
        {...textareaProps}
      />

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
