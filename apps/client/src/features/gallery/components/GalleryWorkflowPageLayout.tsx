import type { ReactNode } from "react";
import { useOutletContext } from "react-router";

import burgerIconUrl from "@/assets/icons/burger.svg";

import type { AuthenticatedLayoutContext } from "@/components/AuthenticatedLayout";

import { CopyrightFooter } from "@/shared/ui/CopyrightFooter";
import { Icon } from "@/shared/ui/Icon";

import { GalleryActionLink } from "./GalleryActionLink";

type GalleryWorkflowPageLayoutProps = {
  title: string;
  actionTo: string;
  actionLabel: string;
  actionLinkClassName?: string;
  footerLeft?: ReactNode;
  children: ReactNode;
};

export function GalleryWorkflowPageLayout({
  title,
  actionTo,
  actionLabel,
  actionLinkClassName = "w-[220px]",
  footerLeft,
  children,
}: GalleryWorkflowPageLayoutProps) {
  const { openMobileSidebar } = useOutletContext<AuthenticatedLayoutContext>();

  return (
    <section className="flex h-[calc(100vh-60px)] min-h-0 flex-col overflow-hidden">
      <header className="mb-[13px] flex min-h-[94px] shrink-0 items-center justify-between gap-4 rounded-2xl bg-page-bg/50 backdrop-blur-[20px]">
        <h1 className="text-2xl font-bold leading-normal text-text-main md:text-[32px]">
          {title}
        </h1>

        <GalleryActionLink
          to={actionTo}
          label={actionLabel}
          className={`hidden min-h-[50px] shrink-0 text-base leading-normal active:bg-brand-active lg:flex ${actionLinkClassName}`}
        />

        <button
          type="button"
          onClick={openMobileSidebar}
          className="flex h-10 w-10 cursor-pointer items-center justify-center lg:hidden"
          aria-label="Open menu"
        >
          <Icon src={burgerIconUrl} className="h-6 w-6" />
        </button>
      </header>

      <GalleryActionLink
        to={actionTo}
        label={actionLabel}
        className="mb-[13px] flex min-h-[50px] w-full shrink-0 text-base leading-normal active:bg-brand-active lg:hidden"
      />

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[30px] bg-white px-5 py-10 shadow-card sm:p-[30px]">
        {children}
      </div>

      {footerLeft ? (
        <div className="mt-6 flex shrink-0 items-center justify-between">
          {footerLeft}

          <CopyrightFooter />
        </div>
      ) : (
        <CopyrightFooter />
      )}
    </section>
  );
}
