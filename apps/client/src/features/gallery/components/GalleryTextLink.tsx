import { Link } from "react-router";

import arrowRightIconUrl from "@/assets/icons/arrow-right.svg";

import { Icon } from "@/shared/ui/Icon";

type GalleryTextLinkProps = {
  to: string;
  label: string;
  className?: string;
  iconClassName?: string;
};

export function GalleryTextLink({
  to,
  label,
  className = "",
  iconClassName = "",
}: GalleryTextLinkProps) {
  return (
    <Link
      to={to}
      className={`flex cursor-pointer items-center gap-[10px] text-[16px] font-bold leading-[150%] text-brand hover:text-brand-active ${className}`}
    >
      <span>{label}</span>
      <Icon
        src={arrowRightIconUrl}
        className={`h-[12px] w-[15px] text-current ${iconClassName}`}
      />
    </Link>
  );
}
