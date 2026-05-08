import { useOutletContext } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import burgerIconUrl from "@/assets/icons/burger.svg";
import companyIconUrl from "@/assets/icons/company.svg";
import profileIconUrl from "@/assets/icons/profile.svg";
import profileBannerUrl from "@/assets/profile-banner.png";

import type { AuthenticatedLayoutContext } from "@/components/AuthenticatedLayout";
import { getProfile, updateProfile } from "@/features/profile/profileApi";
import { getInitials } from "@/features/profile/getInitials";
import { isUnauthorizedError } from "@/shared/api/isUnauthorizedError";
import { FormInputField } from "@/shared/ui/FormInputField";
import { PasswordInputField } from "@/shared/ui/PasswordInputField";
import { CopyrightFooter } from "@/shared/ui/CopyrightFooter";
import { SettingsCard } from "@/shared/ui/SettingsCard";
import { Icon } from "@/shared/ui/Icon";
import { useState } from "react";
import { getApiErrorMessage } from "@/features/auth/getApiErrorMessage";
import { Form, Formik } from "formik";
import { FormSubmitButton } from "@/shared/ui/FormSubmitButton";
import type { AccountSettingsFormValues } from "@/features/profile/types";
import { validateAccountSettingsForm } from "@/features/profile/validateAccountSettingsForm";

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

  const [accountApiError, setAccountApiError] = useState("");
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      setAccountApiError("");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      setAccountApiError(getApiErrorMessage(error));
    },
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

  if (!profile) {
    return <p>Failed to load profile</p>;
  }

  const fullName = `${profile.firstname} ${profile.lastname}`;
  const initials = getInitials(profile.firstname, profile.lastname);

  const accountInitialValues: AccountSettingsFormValues = {
    firstname: profile.firstname,
    lastname: profile.lastname,
  };

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

      <div className="rounded-[30px] bg-white px-[24px] pb-[38px] pt-[24px] shadow-card">
        <div className="h-[132px] rounded-[16px] bg-cover bg-center">
          <img
            src={profileBannerUrl}
            alt=""
            className="h-full w-full rounded-[16px] object-cover"
          />
        </div>

        <div className="-mt-[55px] flex flex-col items-center text-center">
          <div className="flex h-[110px] w-[110px] items-center justify-center rounded-full border-[5px] border-white bg-avatar text-[32px] font-bold leading-[150%] text-white">
            {initials}
          </div>

          <h2 className="mt-[12px] text-[28px] font-bold leading-[150%] text-text-main">
            {fullName}
          </h2>

          <p className="text-[18px] font-normal leading-[150%] text-text-secondary">
            {profile.email}
          </p>
        </div>
      </div>

      <div className="mt-[20px] grid gap-[16px] lg:grid-cols-2 lg:gap-[20px]">
        <SettingsCard
          title="Account Settings"
          description="Here you can change your account information."
        >
          <Formik<AccountSettingsFormValues>
            initialValues={accountInitialValues}
            enableReinitialize
            validate={validateAccountSettingsForm}
            validateOnMount
            onSubmit={(values) => {
              setAccountApiError("");

              updateProfileMutation.mutate(values);
            }}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              isValid,
              dirty,
            }) => {
              const isSubmitDisabled =
                !dirty ||
                !values.firstname.trim() ||
                !values.lastname.trim() ||
                !isValid ||
                updateProfileMutation.isPending;

              return (
                <Form className="flex flex-col gap-[24px]">
                  <FormInputField
                    label="First name"
                    name="firstname"
                    value={values.firstname}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.firstname ? errors.firstname : undefined}
                    startIcon={
                      <Icon
                        src={profileIconUrl}
                        className="h-[20px] w-[20px] text-text-main"
                      />
                    }
                  />

                  <FormInputField
                    label="Last name"
                    name="lastname"
                    value={values.lastname}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.lastname ? errors.lastname : undefined}
                    startIcon={
                      <Icon
                        src={profileIconUrl}
                        className="h-[20px] w-[20px] text-text-main"
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
                        className="h-[20px] w-[20px] text-text-main"
                      />
                    }
                  />

                  {accountApiError && (
                    <p className="text-[14px] font-normal leading-[150%] text-error">
                      {accountApiError}
                    </p>
                  )}

                  {/* <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="mx-auto mt-[4px] h-[50px] w-full rounded-[16px] bg-brand text-[14px] font-bold leading-[150%] text-white disabled:cursor-not-allowed disabled:opacity-70 lg:ml-auto lg:mr-0 lg:w-[180px]"
                >
                  Save changes
                </button> */}
                  <div className="mx-auto mt-[4px] w-full lg:ml-auto lg:mr-0 lg:w-[180px]">
                    <FormSubmitButton
                      text="Save changes"
                      disabled={isSubmitDisabled}
                    />
                  </div>
                </Form>
              );
            }}
          </Formik>
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
              className="mx-auto mt-[4px] h-[50px] w-full rounded-[16px] bg-brand text-[14px] font-bold leading-[150%] text-white lg:ml-auto lg:mr-0 lg:w-[180px]"
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
