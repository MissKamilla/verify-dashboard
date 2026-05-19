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
        className="text-sm font-medium leading-none text-text-main"
      >
        {label}
        {textareaProps.required && <span className="text-error"> *</span>}
      </label>

      <textarea
        id={textareaId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`min-h-[100px] w-full resize-none rounded-2xl border px-[18px] py-4 text-sm font-normal leading-normal text-text-main outline-none placeholder:text-text-muted  lg:min-h-[114px] ${textareaBorderClass}`}
        {...textareaProps}
      />

      {error && (
        <p
          id={errorId}
          className="text-xs font-normal leading-6 text-error"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
