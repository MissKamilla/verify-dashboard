import { Link } from "react-router";

import arrowRightIconUrl from "@/assets/icons/arrow-right.svg";

import { Icon } from "@/shared/ui/Icon";

type GalleryBackLinkVariant = "default" | "brand";

type GalleryBackLinkProps = {
  to: string;
  label?: string;
  variant?: GalleryBackLinkVariant;
  className?: string;
};

const variantClassNames: Record<GalleryBackLinkVariant, string> = {
  default: "text-text-main hover:text-brand",
  brand: "text-brand hover:text-brand-active",
};

export function GalleryBackLink({
  to,
  label = "Back",
  variant = "default",
  className = "",
}: GalleryBackLinkProps) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 text-base font-bold leading-normal ${variantClassNames[variant]} ${className}`}
    >
      <Icon
        src={arrowRightIconUrl}
        className="h-3 w-[15px] rotate-180 text-current"
      />
      <span>{label}</span>
    </Link>
  );
}
