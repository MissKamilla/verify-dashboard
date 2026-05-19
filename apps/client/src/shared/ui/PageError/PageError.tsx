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
    <div className="flex min-h-[420px] items-center justify-center rounded-[30px] bg-white px-6 text-center shadow-card">
      <div className="max-w-[360px]">
        <h2 className="text-2xl font-bold leading-normal text-text-main">
          {title}
        </h2>

        <p className="mt-2 text-base font-normal leading-normal text-text-secondary">
          {description}
        </p>

        {onAction && (
          <button
            type="button"
            onClick={onAction}
            disabled={isActionPending}
            className="mt-6 h-[50px] min-w-[160px] cursor-pointer rounded-2xl bg-brand px-6 text-sm font-bold leading-normal text-white hover:bg-avatar active:bg-brand-active disabled:cursor-not-allowed disabled:bg-border-default disabled:text-text-secondary disabled:hover:bg-border-default disabled:active:bg-border-default"
          >
            {isActionPending ? pendingActionText : actionText}
          </button>
        )}
      </div>
    </div>
  );
}
