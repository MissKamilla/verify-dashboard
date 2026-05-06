type FormSubmitButtonProps = {
  text: string;
  disabled: boolean;
};

export function FormSubmitButton({ text, disabled }: FormSubmitButtonProps) {
  const buttonStateClass = disabled
    ? "bg-[#DBDADA] text-[#878787] disabled:cursor-not-allowed"
    : "bg-[#168B6C] text-white";

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
