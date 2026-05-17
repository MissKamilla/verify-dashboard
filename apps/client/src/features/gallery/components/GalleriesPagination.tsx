type PaginationItem = number | "dots";

type GalleriesPaginationProps = {
  currentPage: number;
  totalPages: number;
  shownItemsCount: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

function getPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "dots", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, "dots", totalPages - 2, totalPages - 1, totalPages];
  }

  return [
    1,
    "dots",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "dots",
    totalPages,
  ];
}

export function GalleriesPagination({
  currentPage,
  totalPages,
  shownItemsCount,
  totalItems,
  onPageChange,
}: GalleriesPaginationProps) {
  const paginationItems = getPaginationItems(currentPage, totalPages);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex shrink-0 items-center justify-between gap-4 bg-white px-[30px] pb-6 pt-4 lg:absolute lg:right-[30px] lg:bottom-[22px] lg:left-[30px] lg:z-20 lg:bg-transparent lg:p-0">
      <p className="text-base leading-normal text-text-main">
        <span className="font-bold">{shownItemsCount}</span> of {totalItems}{" "}
        galleries
      </p>

      <div className="flex items-center gap-4 text-sm leading-none text-text-main lg:gap-[18px]">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="cursor-pointer text-text-secondary disabled:cursor-not-allowed disabled:text-border-default"
          aria-label="Previous page"
        >
          ‹
        </button>

        {paginationItems.map((item, index) =>
          item === "dots" ? (
            <span key={`dots-${index}`} className="text-text-main">
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={
                item === currentPage
                  ? "h-[30px] w-[30px] rounded-[6px] bg-brand text-white"
                  : "h-[30px] w-[30px] cursor-pointer text-text-main"
              }
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="cursor-pointer text-text-secondary disabled:cursor-not-allowed disabled:text-border-default"
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
}
