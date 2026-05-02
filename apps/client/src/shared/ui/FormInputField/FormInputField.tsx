import { useId, type ComponentProps } from "react";

type FormFieldProps = {
  label: string;
  error?: string;
} & ComponentProps<"input">;

export function FormInputField({
  label,
  error,
  id,
  ...inputProps
}: FormFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div>
      <label htmlFor={inputId}>{label}</label>

      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />

      {error && <p id={errorId}>{error}</p>}
    </div>
  );
}
