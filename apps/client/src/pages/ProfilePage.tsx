import { useState } from "react";
import { useOutletContext } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

import burgerIconUrl from "@/assets/icons/burger.svg";

import type { AuthenticatedLayoutContext } from "@/components/AuthenticatedLayout";

import { getInitials } from "@/features/profile/getInitials";
import {
  profileQueryKey,
  useProfileQuery,
} from "@/features/profile/profileQueries";
import { ProfileHeaderCard } from "@/features/profile/components/ProfileHeaderCard";
import { AccountSettingsForm } from "@/features/profile/components/AccountSettingsForm";
import { ChangePasswordForm } from "@/features/profile/components/ChangePasswordForm";

import { isUnauthorizedError } from "@/shared/api/isUnauthorizedError";
import { CopyrightFooter } from "@/shared/ui/CopyrightFooter";
import { Icon } from "@/shared/ui/Icon";
import { SuccessModal } from "@/shared/ui/SuccessModal";
import { PageLoader } from "@/shared/ui/PageLoader";
import { PageError } from "@/shared/ui/PageError";

export function ProfilePage() {
  const { openMobileSidebar } = useOutletContext<AuthenticatedLayoutContext>();

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const {
    data: profile,
    error,
    isError,
    isPending,
    isFetching,
  } = useProfileQuery();

  const queryClient = useQueryClient();
  const handleProfileRetry = () => {
    void queryClient.invalidateQueries({ queryKey: profileQueryKey });
  };

  if (isPending || (isError && isUnauthorizedError(error))) {
    return <PageLoader text="Loading profile..." />;
  }

  if (isError || !profile) {
    return (
      <PageError
        title="Couldn’t load profile"
        description="Please try again."
        onAction={handleProfileRetry}
        isActionPending={isFetching}
      />
    );
  }

  const fullName = `${profile.firstname} ${profile.lastname}`;
  const initials = getInitials(profile.firstname, profile.lastname);

  return (
    <section className="flex min-h-[calc(100vh-60px)] flex-col">
      <header className="mb-[30px] flex items-center justify-between">
        <h1 className="text-[32px] font-bold leading-[150%] text-text-main">
          Profile settings
        </h1>

        <button
          type="button"
          onClick={openMobileSidebar}
          className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center lg:hidden"
          aria-label="Open menu"
        >
          <Icon src={burgerIconUrl} className="h-[24px] w-[24px]" />
        </button>
      </header>

      <ProfileHeaderCard
        fullName={fullName}
        email={profile.email}
        initials={initials}
      />

      <div className="mt-[20px] grid gap-[16px] lg:grid-cols-2 lg:gap-[20px]">
        <AccountSettingsForm
          profile={profile}
          onSuccess={() => setIsSuccessModalOpen(true)}
        />

        <ChangePasswordForm onSuccess={() => setIsSuccessModalOpen(true)} />
      </div>

      <CopyrightFooter />
      <SuccessModal
        isOpen={isSuccessModalOpen}
        title="Changes saved"
        description="Your changes were successfully saved."
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </section>
  );
}
