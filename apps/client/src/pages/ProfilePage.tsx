import { useState } from "react";
import { useOutletContext } from "react-router";

import burgerIconUrl from "@/assets/icons/burger.svg";

import type { AuthenticatedLayoutContext } from "@/components/AuthenticatedLayout";

import { isUnauthorizedError } from "@/shared/api/isUnauthorizedError";
import { CopyrightFooter } from "@/shared/ui/CopyrightFooter";
import { Icon } from "@/shared/ui/Icon";
import { SuccessModal } from "@/shared/ui/SuccessModal";

import { getInitials } from "@/features/profile/getInitials";
import { useProfileQuery } from "@/features/profile/profileQueries";
import { ProfileHeaderCard } from "@/features/profile/components/ProfileHeaderCard";
import { AccountSettingsForm } from "@/features/profile/components/AccountSettingsForm";
import { ChangePasswordForm } from "@/features/profile/components/ChangePasswordForm";

export function ProfilePage() {
  const { openMobileSidebar } = useOutletContext<AuthenticatedLayoutContext>();

  const { data: profile, error, isError, isPending } = useProfileQuery();

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  if (isPending) {
    return <p>Loading profile...</p>;
  }

  if (isError) {
    if (isUnauthorizedError(error)) {
      return <p>Redirecting to login...</p>;
    }

    return <p>Failed to load profile</p>;
  }

  if (!profile) {
    return <p>Failed to load profile</p>;
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
