import type { GalleryRole } from "@/features/gallery/types";

type GalleryRoleBadgeProps = {
  role: GalleryRole;
};

const roleLabels: Record<GalleryRole, string> = {
  owner: "Owner",
  editor: "Editor",
  viewer: "Viewer",
};

export function GalleryRoleBadge({ role }: GalleryRoleBadgeProps) {
  return (
    <span className="inline-flex rounded-full border border-border-default bg-white px-3 py-1 text-xs font-bold text-text-secondary">
      {roleLabels[role]}
    </span>
  );
}
