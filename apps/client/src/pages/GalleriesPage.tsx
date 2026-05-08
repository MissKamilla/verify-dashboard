import { useOutletContext } from "react-router";

import type { AuthenticatedLayoutContext } from "@/components/AuthenticatedLayout";

import burgerIconUrl from "@/assets/icons/burger.svg";
import galleryEmptyImageUrl from "@/assets/gallery-empty.svg";
import arrowRightIconUrl from "@/assets/icons/arrow-right.svg";
import { CopyrightFooter } from "@/shared/ui/CopyrightFooter";
import { Icon } from "@/shared/ui/Icon";

export function GalleriesPage() {
  const { openMobileSidebar } = useOutletContext<AuthenticatedLayoutContext>();

  return (
    <section className="flex min-h-[calc(100vh-60px)] flex-col">
      <header className="mb-[13px] flex h-[94px] items-center justify-between rounded-[16px] bg-[#FCFCFC]/50 backdrop-blur-[20px]">
        <h1 className="text-[32px] font-bold leading-[150%] text-[#161616]">
          Gallery
        </h1>

        <button
          type="button"
          className="hidden h-[50px] w-[250px] cursor-pointer items-center justify-center gap-[10px] rounded-[16px] border border-[#168B6C] text-[16px] font-bold leading-[150%] text-[#168B6C] lg:flex"
        >
          <span>Go to upload photos</span>
          <Icon
            src={arrowRightIconUrl}
            className="h-[12px] w-[15px] text-[#168B6C]"
          />
        </button>

        <button
          type="button"
          onClick={openMobileSidebar}
          className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center lg:hidden"
          aria-label="Open menu"
        >
          <Icon src={burgerIconUrl} className="h-[24px] w-[24px]" />
        </button>
      </header>

      <div className="flex min-h-[620px] flex-1 items-center justify-center rounded-[30px] bg-white shadow-[14px_17px_40px_4px_rgba(125,181,147,0.08)]">
        <div className="flex w-full max-w-[434px] flex-col items-center text-center">
          <h2 className="text-[24px] font-bold leading-[150%] text-[#161616]">
            Gallery Is Empty
          </h2>

          <p className="mt-[8px] text-[18px] font-normal leading-[150%] text-[#878787]">
            You don't have any uploaded photos. Please, click on the "Go to
            upload photos" and upload your photos.
          </p>
          <img
            src={galleryEmptyImageUrl}
            alt=""
            className="mt-[40px] h-[274px] w-[308px] object-contain"
          />

          <button
            type="button"
            className="mt-[28px] flex cursor-pointer items-center gap-[10px] text-[16px] font-bold uppercase leading-[150%] text-[#168B6C]"
          >
            <span>Go to upload photos</span>
            <Icon
              src={arrowRightIconUrl}
              className="h-[12px] w-[15px] text-[#168B6C]"
            />
          </button>
        </div>
      </div>

      <CopyrightFooter />
    </section>
  );
}
