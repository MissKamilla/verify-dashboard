import loadingIconUrl from "@/assets/icons/loading.svg";

type PageLoaderProps = {
  text?: string;
};

export function PageLoader({ text = "Loading..." }: PageLoaderProps) {
  return (
    <div
      className="flex min-h-[420px] items-center justify-center rounded-[30px] bg-white shadow-card"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-[16px]">
        <img
          src={loadingIconUrl}
          alt=""
          className="h-[60px] w-[60px] animate-spin"
          aria-hidden="true"
        />

        <p className="text-[16px] font-normal leading-[150%] text-text-secondary">
          {text}
        </p>
      </div>
    </div>
  );
}
