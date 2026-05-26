import type { GetGalleriesParams } from "@/features/gallery/types";
import { Dropdown } from "@/shared/ui/Dropdown";

export type GallerySortBy = NonNullable<GetGalleriesParams["sortBy"]>;
export type GallerySortOrder = NonNullable<GetGalleriesParams["sortOrder"]>;

type GalleriesFiltersProps = {
  searchValue: string;
  sortBy: GallerySortBy;
  sortOrder: GallerySortOrder;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onSortByChange: (value: GallerySortBy) => void;
  onSortOrderChange: (value: GallerySortOrder) => void;
  onClearFilters: () => void;
};

const fieldClassName =
  "h-[50px] w-full rounded-2xl border border-border-default bg-white px-4 text-sm text-text-main outline-none focus:border-brand";

const sortByOptions: { value: GallerySortBy; label: string }[] = [
  { value: "createdAt", label: "Created" },
  { value: "title", label: "Title" },
];

const createdAtSortOrderOptions: { value: GallerySortOrder; label: string }[] =
  [
    { value: "DESC", label: "Newest" },
    { value: "ASC", label: "Oldest" },
  ];

const titleSortOrderOptions: { value: GallerySortOrder; label: string }[] = [
  { value: "ASC", label: "A–Z" },
  { value: "DESC", label: "Z–A" },
];

export function GalleriesFilters({
  searchValue,
  sortBy,
  sortOrder,
  hasActiveFilters,
  onSearchChange,
  onSortByChange,
  onSortOrderChange,
  onClearFilters,
}: GalleriesFiltersProps) {
  return (
    <div className="mb-4 shrink-0 px-[30px]">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_150px_150px_110px]">
        <input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search galleries..."
          className={fieldClassName}
          aria-label="Search galleries"
        />

        <Dropdown
          value={sortBy}
          options={sortByOptions}
          ariaLabel="Sort galleries by"
          onChange={onSortByChange}
        />

        <Dropdown
          value={sortOrder}
          options={
            sortBy === "createdAt"
              ? createdAtSortOrderOptions
              : titleSortOrderOptions
          }
          ariaLabel="Sort order"
          onChange={onSortOrderChange}
        />

        <button
          type="button"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
          className="h-[50px] cursor-pointer rounded-2xl border border-brand px-5 text-sm font-bold leading-none text-brand transition-colors hover:border-avatar hover:bg-avatar hover:text-white active:bg-brand-active disabled:cursor-not-allowed disabled:border-border-default disabled:text-text-muted disabled:hover:bg-transparent"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
