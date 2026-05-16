import photoPreviewIconUrl from "@/assets/icons/photo-preview.svg";

import { Icon } from "@/shared/ui/Icon";

type PhotoPreviewCardProps = {
  className?: string;
};

export function PhotoPreviewCard({ className = "" }: PhotoPreviewCardProps) {
  return (
    <div
      className={`flex aspect-square w-full min-w-[115px] max-w-[180px] items-center justify-center rounded-[16px] border border-border-default text-border-default ${className}`}
    >
      <div className="flex flex-col items-center gap-[6px]">
        <Icon src={photoPreviewIconUrl} className="h-[48px] w-[48px]" />

        <span className="text-[12px] font-bold leading-[150%]">
          Photo preview
        </span>
      </div>
    </div>
  );
}
