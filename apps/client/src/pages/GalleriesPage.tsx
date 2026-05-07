import burgerIconUrl from "@/assets/icons/burger.svg";
import type { AuthenticatedLayoutContext } from "@/components/AuthenticatedLayout";
import { useOutletContext } from "react-router";

export function GalleriesPage() {
  const { openMobileSidebar } = useOutletContext<AuthenticatedLayoutContext>();

  return (
    <section>
      <header className="mb-[24px] flex items-center justify-between lg:hidden">
        <h1 className="text-[24px] font-bold leading-[150%] text-[#161616]">
          Gallery
        </h1>

        <button
          type="button"
          onClick={openMobileSidebar}
          className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center"
          aria-label="Open menu"
        >
          <img src={burgerIconUrl} alt="" className="h-[24px] w-[24px]" />
        </button>
      </header>

      <p>GalleriesPage</p>
    </section>
  );
}
