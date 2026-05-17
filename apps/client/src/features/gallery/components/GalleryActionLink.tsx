import { Link } from "react-router";

import arrowRightIconUrl from "@/assets/icons/arrow-right.svg";

import { Icon } from "@/shared/ui/Icon";

type GalleryActionLinkProps = {
  to: string;
  label: string;
  className: string;
};

const galleryActionLinkBaseClassName =
  "cursor-pointer items-center justify-center gap-[10px] rounded-[16px] border border-brand font-bold text-brand transition-colors hover:border-avatar hover:bg-avatar hover:text-white";

export function GalleryActionLink({
  to,
  label,
  className,
}: GalleryActionLinkProps) {
  return (
    <Link to={to} className={`${galleryActionLinkBaseClassName} ${className}`}>
      <span>{label}</span>
      <Icon
        src={arrowRightIconUrl}
        className="h-[12px] w-[15px] text-current"
      />
    </Link>
  );
}
