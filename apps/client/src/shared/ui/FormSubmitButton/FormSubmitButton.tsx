type FormSubmitButtonProps = {
  text: string;
  disabled: boolean;
};

export function FormSubmitButton({ text, disabled }: FormSubmitButtonProps) {
  const buttonStateClass = disabled
    ? "bg-border-default text-text-secondary disabled:cursor-not-allowed"
    : "bg-brand text-white hover:bg-avatar active:bg-brand-active";

  return (
    <button
      type="submit"
      disabled={disabled}
      className={`h-[50px] w-full rounded-[16px] text-[14px] font-bold leading-none ${buttonStateClass}`}
    >
      {text}
    </button>
  );
}
