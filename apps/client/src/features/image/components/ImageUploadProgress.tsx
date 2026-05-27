import checkIconUrl from "@/assets/icons/check.svg";

import { Icon } from "@/shared/ui/Icon";

type ImageUploadProgressProps = {
  loadedBytes: number;
  percent: number;
  isCompleted: boolean;
};

const formatUploadSize = (bytes: number) => {
  const megabytes = bytes / 1024 / 1024;

  if (megabytes < 1) {
    return `${megabytes.toFixed(1)}MB`;
  }

  return `${Math.round(megabytes)}MB`;
};

export function ImageUploadProgress({
  loadedBytes,
  percent,
  isCompleted,
}: ImageUploadProgressProps) {
  const normalizedPercent = Math.min(Math.max(percent, 0), 100);
  const progressLabel =
    normalizedPercent < 100 ? "Uploading..." : "Processing...";

  return (
    <div className="w-full max-w-[330px]">
      <div className="mb-[10px] flex items-center justify-between">
        <p className="text-sm font-bold leading-normal text-text-main">
          {isCompleted ? "Completed!" : progressLabel}
        </p>

        {isCompleted && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-alert-success-bg text-brand">
            <Icon src={checkIconUrl} className="h-3 w-3 text-current" />
          </span>
        )}
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-border-default">
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-200"
          style={{ width: `${normalizedPercent}%` }}
        />
      </div>

      <div className="mt-[10px] flex items-center justify-between text-sm leading-normal text-text-secondary">
        <span>{formatUploadSize(loadedBytes)}</span>
        <span>{normalizedPercent}%</span>
      </div>
    </div>
  );
}
