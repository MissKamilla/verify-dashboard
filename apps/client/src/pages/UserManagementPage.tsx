import { useState } from "react";
import { useOutletContext } from "react-router";

import burgerIconUrl from "@/assets/icons/burger.svg";

import type { AuthenticatedLayoutContext } from "@/components/AuthenticatedLayout";

import { useAllGalleriesQuery } from "@/features/gallery/galleryQueries";

import { CopyrightFooter } from "@/shared/ui/CopyrightFooter";
import { Dropdown } from "@/shared/ui/Dropdown";
import { Icon } from "@/shared/ui/Icon";
import { PageError } from "@/shared/ui/PageError";
import { PageLoader } from "@/shared/ui/PageLoader";
import { SettingsCard } from "@/shared/ui/SettingsCard";

export function UserManagementPage() {
  const { openMobileSidebar } = useOutletContext<AuthenticatedLayoutContext>();

  const [selectedGalleryId, setSelectedGalleryId] = useState("");

  const {
    data: galleries = [],
    isPending,
    isError,
    isFetching,
    refetch,
  } = useAllGalleriesQuery();

  if (isPending) {
    return <PageLoader text="Loading galleries..." />;
  }

  if (isError) {
    return (
      <PageError
        title="Couldn’t load galleries"
        description="Please try again."
        onAction={() => void refetch()}
        isActionPending={isFetching}
      />
    );
  }

  const ownerGalleries = galleries.filter(
    (gallery) => gallery.role === "owner",
  );

  const galleryOptions = ownerGalleries.map((gallery) => ({
    value: String(gallery.id),
    label: gallery.title,
  }));

  return (
    <section className="flex min-h-[calc(100vh-60px)] flex-col">
      <header className="mb-[30px] flex items-center justify-between">
        <h1 className="text-2xl font-bold leading-normal text-text-main lg:text-[32px]">
          User management
        </h1>

        <button
          type="button"
          onClick={openMobileSidebar}
          className="flex h-10 w-10 cursor-pointer items-center justify-center lg:hidden"
          aria-label="Open menu"
        >
          <Icon src={burgerIconUrl} className="h-6 w-6" />
        </button>
      </header>

      {ownerGalleries.length === 0 ? (
        <div className="rounded-[30px] bg-white p-[30px] text-center shadow-card">
          <h2 className="text-2xl font-bold text-text-main">
            No galleries available
          </h2>

          <p className="mt-2 text-base text-text-secondary">
            You need to own a gallery before you can manage its access.
          </p>
        </div>
      ) : (
        <SettingsCard
          title="Select gallery"
          description="Choose a gallery whose access you want to manage."
        >
          <Dropdown
            value={selectedGalleryId}
            options={galleryOptions}
            placeholder="Select a gallery"
            ariaLabel="Select gallery"
            onChange={setSelectedGalleryId}
          />

          {selectedGalleryId && (
            <p className="mt-5 text-base text-text-secondary">
              Access management will be displayed here.
            </p>
          )}
        </SettingsCard>
      )}

      <CopyrightFooter />
    </section>
  );
}
