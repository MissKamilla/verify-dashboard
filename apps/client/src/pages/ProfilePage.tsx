import { useOutletContext } from "react-router";
import { useQuery } from "@tanstack/react-query";

import burgerIconUrl from "@/assets/icons/burger.svg";
import companyIconUrl from "@/assets/icons/company.svg";
import profileIconUrl from "@/assets/icons/profile.svg";
import profileBannerUrl from "@/assets/profile-banner.png";

import type { AuthenticatedLayoutContext } from "@/components/AuthenticatedLayout";
import { getProfile } from "@/features/profile/profileApi";
import { getInitials } from "@/features/profile/getInitials";
import { isUnauthorizedError } from "@/shared/api/isUnauthorizedError";
import { FormInputField } from "@/shared/ui/FormInputField";
import { PasswordInputField } from "@/shared/ui/PasswordInputField";
import { CopyrightFooter } from "@/shared/ui/CopyrightFooter";
import { SettingsCard } from "@/shared/ui/SettingsCard";
import { Icon } from "@/shared/ui/Icon";

export function ProfilePage() {
  const { openMobileSidebar } = useOutletContext<AuthenticatedLayoutContext>();
  const {
    data: profile,
    error,
    isError,
    isPending,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    retry: false,
  });

  if (isPending) {
    return <p>Loading profile...</p>;
  }

  if (isError) {
    if (isUnauthorizedError(error)) {
      return <p>Redirecting to login...</p>;
    }

    return <p>Failed to load profile</p>;
  }

  const fullName = `${profile.firstname} ${profile.lastname}`;
  const initials = getInitials(profile.firstname, profile.lastname);

  return (
    <section className="flex min-h-[calc(100vh-60px)] flex-col">
      <header className="mb-[30px] flex items-center justify-between">
        <h1 className="text-[32px] font-bold leading-[150%] text-[#161616]">
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

      <div className="rounded-[30px] bg-white px-[24px] pb-[38px] pt-[24px] shadow-[14px_17px_40px_4px_rgba(125,181,147,0.08)]">
        <div className="h-[132px] rounded-[16px] bg-cover bg-center">
          <img
            src={profileBannerUrl}
            alt=""
            className="h-full w-full rounded-[16px] object-cover"
          />

          <Icon src={burgerIconUrl} className="h-[24px] w-[24px]" />
        </div>

        <div className="-mt-[55px] flex flex-col items-center text-center">
          <div className="flex h-[110px] w-[110px] items-center justify-center rounded-full border-[5px] border-white bg-[#1FB28B] text-[32px] font-bold leading-[150%] text-white">
            {initials}
          </div>

          <h2 className="mt-[12px] text-[28px] font-bold leading-[150%] text-[#161616]">
            {fullName}
          </h2>

          <p className="text-[18px] font-normal leading-[150%] text-[#878787]">
            {profile.email}
          </p>
        </div>
      </div>

      <div className="mt-[20px] grid gap-[16px] lg:grid-cols-2 lg:gap-[20px]">
        <SettingsCard
          title="Account Settings"
          description="Here you can change your account information."
        >
          <form className="flex flex-col gap-[24px]">
            <FormInputField
              label="First name"
              name="firstname"
              value={profile.firstname}
              readOnly
              startIcon={
                <Icon
                  src={profileIconUrl}
                  className="h-[20px] w-[20px] text-[#161616]"
                />
              }
            />

            <FormInputField
              label="Last name"
              name="lastname"
              value={profile.lastname}
              readOnly
              startIcon={
                <Icon
                  src={profileIconUrl}
                  className="h-[20px] w-[20px] text-[#161616]"
                />
              }
            />

            <FormInputField
              label="Company"
              name="company"
              value="New Group"
              readOnly
              startIcon={
                <Icon
                  src={companyIconUrl}
                  className="h-[20px] w-[20px] text-[#161616]"
                />
              }
            />

            <button
              type="button"
              className="mx-auto mt-[4px] h-[50px] w-full rounded-[16px] bg-[#168B6C] text-[14px] font-bold leading-[150%] text-white lg:ml-auto lg:mr-0 lg:w-[180px]"
            >
              Save changes
            </button>
          </form>
        </SettingsCard>

        <SettingsCard
          title="Change Password"
          description="Here you can set your new password."
        >
          <form className="flex flex-col gap-[24px]">
            <PasswordInputField
              label="Old password"
              name="oldPassword"
              placeholder="********"
            />

            <PasswordInputField
              label="New password"
              name="newPassword"
              placeholder="Min. 8 characters"
            />

            <PasswordInputField
              label="New password confirmation"
              name="confirmNewPassword"
              placeholder="New password confirmation"
            />

            <button
              type="button"
              className="mx-auto mt-[4px] h-[50px] w-full rounded-[16px] bg-[#168B6C] text-[14px] font-bold leading-[150%] text-white lg:ml-auto lg:mr-0 lg:w-[180px]"
            >
              Change password
            </button>
          </form>
        </SettingsCard>
      </div>

      <CopyrightFooter />
    </section>
  );
}
