type PageErrorProps = {
  title: string;
  description: string;
  actionText?: string;
  pendingActionText?: string;
  isActionPending?: boolean;
  onAction?: () => void;
};

export function PageError({
  title,
  description,
  actionText = "Try again",
  pendingActionText = "Retrying...",
  isActionPending = false,
  onAction,
}: PageErrorProps) {
  return (
    <div className="flex min-h-[420px] items-center justify-center rounded-[30px] bg-white px-[24px] text-center shadow-card">
      <div className="max-w-[360px]">
        <h2 className="text-[24px] font-bold leading-[150%] text-text-main">
          {title}
        </h2>

        <p className="mt-[8px] text-[16px] font-normal leading-[150%] text-text-secondary">
          {description}
        </p>

        {onAction && (
          <button
            type="button"
            onClick={onAction}
            disabled={isActionPending}
            className="mt-[24px] h-[50px] min-w-[160px] rounded-[16px] bg-brand px-[24px] text-[14px] font-bold leading-[150%] text-white disabled:cursor-not-allowed disabled:bg-border-default disabled:text-text-secondary"
          >
            {isActionPending ? pendingActionText : actionText}
          </button>
        )}
      </div>
    </div>
  );
}
