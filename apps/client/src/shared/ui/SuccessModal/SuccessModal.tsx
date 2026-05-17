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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[438px] rounded-2xl bg-white px-8 pb-12 pt-[46px] text-center"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 flex h-6 w-6 cursor-pointer items-center justify-center"
          aria-label="Close modal"
        >
          <Icon src={closeIconUrl} className="h-4 w-4 text-text-main" />
        </button>

        <h2 className="text-[28px] font-bold leading-normal text-text-main">
          {title}
        </h2>

        <div className="mx-auto mt-[18px] flex h-[88px] w-[88px] items-center justify-center rounded-full bg-avatar text-[54px] leading-none text-white">
          <Icon src={checkIconUrl} className="h-5 w-[28px] text-white" />
        </div>

        <p className="mt-5 text-lg font-normal leading-normal text-text-secondary">
          {description}
        </p>
      </div>
    </div>
  );
}
