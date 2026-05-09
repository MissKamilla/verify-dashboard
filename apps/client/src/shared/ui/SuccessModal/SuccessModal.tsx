import closeIconUrl from "@/assets/icons/close.svg";
import checkIconUrl from "@/assets/icons/check.svg";

import { Icon } from "@/shared/ui/Icon";

type SuccessModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  onClose: () => void;
};

export function SuccessModal({
  isOpen,
  title,
  description,
  onClose,
}: SuccessModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-[24px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[438px] rounded-[16px] bg-white px-[32px] pb-[48px] pt-[46px] text-center"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-[24px] top-[24px] flex h-[24px] w-[24px] cursor-pointer items-center justify-center"
          aria-label="Close modal"
        >
          <Icon
            src={closeIconUrl}
            className="h-[16px] w-[16px] text-text-main"
          />
        </button>

        <h2 className="text-[28px] font-bold leading-[150%] text-text-main">
          {title}
        </h2>

        <div className="mx-auto mt-[18px] flex h-[88px] w-[88px] items-center justify-center rounded-full bg-avatar text-[54px] leading-none text-white">
          <Icon src={checkIconUrl} className="h-[20px] w-[28px] text-white" />
        </div>

        <p className="mt-[20px] text-[18px] font-normal leading-[150%] text-text-secondary">
          {description}
        </p>
      </div>
    </div>
  );
}
