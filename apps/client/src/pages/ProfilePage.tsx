import { useState } from "react";
import { useOutletContext } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Form, Formik, type FormikHelpers } from "formik";

import burgerIconUrl from "@/assets/icons/burger.svg";
import companyIconUrl from "@/assets/icons/company.svg";
import profileIconUrl from "@/assets/icons/profile.svg";
import profileBannerUrl from "@/assets/profile-banner.png";

import type { AuthenticatedLayoutContext } from "@/components/AuthenticatedLayout";

import { getApiErrorMessage } from "@/features/auth/getApiErrorMessage";
import { getInitials } from "@/features/profile/getInitials";
import { getProfile, updateProfile } from "@/features/profile/profileApi";
import type {
  AccountSettingsFormValues,
  ChangePasswordFormValues,
} from "@/features/profile/types";
import { validateAccountSettingsForm } from "@/features/profile/validateAccountSettingsForm";
import { validateChangePasswordForm } from "@/features/profile/validateChangePasswordForm";

import { isUnauthorizedError } from "@/shared/api/isUnauthorizedError";
import { CopyrightFooter } from "@/shared/ui/CopyrightFooter";
import { FormInputField } from "@/shared/ui/FormInputField";
import { FormSubmitButton } from "@/shared/ui/FormSubmitButton";
import { Icon } from "@/shared/ui/Icon";
import { PasswordInputField } from "@/shared/ui/PasswordInputField";
import { SettingsCard } from "@/shared/ui/SettingsCard";
import { SuccessModal } from "@/shared/ui/SuccessModal";

const changePasswordInitialValues: ChangePasswordFormValues = {
  oldPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

export function ProfilePage() {
  const { openMobileSidebar } = useOutletContext<AuthenticatedLayoutContext>();

  const queryClient = useQueryClient();

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
  const [passwordApiError, setPasswordApiError] = useState("");

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      setAccountApiError("");
      setIsSuccessModalOpen(true);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      setAccountApiError(getApiErrorMessage(error));
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      setPasswordApiError("");
      setIsSuccessModalOpen(true);
    },
    onError: (error) => {
      setPasswordApiError(getApiErrorMessage(error));
    },
  });

  const handleChangePasswordSubmit = (
    values: ChangePasswordFormValues,
    { resetForm }: FormikHelpers<ChangePasswordFormValues>,
  ) => {
    setPasswordApiError("");

    changePasswordMutation.mutate(
      {
        oldPassword: values.oldPassword,
        password: values.newPassword,
      },
      {
        onSuccess: () => {
          resetForm();
        },
      },
    );
  };

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
          <Formik<ChangePasswordFormValues>
            initialValues={changePasswordInitialValues}
            enableReinitialize
            validate={validateChangePasswordForm}
            validateOnMount
            onSubmit={handleChangePasswordSubmit}
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
                !values.oldPassword.trim() ||
                !values.newPassword.trim() ||
                !values.confirmNewPassword.trim() ||
                !isValid ||
                changePasswordMutation.isPending;

              return (
                <Form className="flex flex-col gap-[24px]">
                  <PasswordInputField
                    label="Old password"
                    name="oldPassword"
                    placeholder="********"
                    value={values.oldPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.oldPassword ? errors.oldPassword : undefined}
                  />

                  <PasswordInputField
                    label="New password"
                    name="newPassword"
                    placeholder="Min. 8 characters"
                    value={values.newPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.newPassword ? errors.newPassword : undefined}
                  />

                  <PasswordInputField
                    label="New password confirmation"
                    name="confirmNewPassword"
                    placeholder="New password confirmation"
                    value={values.confirmNewPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touched.confirmNewPassword
                        ? errors.confirmNewPassword
                        : undefined
                    }
                  />

                  {passwordApiError && (
                    <p className="text-[14px] font-normal leading-[150%] text-error">
                      {passwordApiError}
                    </p>
                  )}

                  <div className="mx-auto mt-[4px] w-full lg:ml-auto lg:mr-0 lg:w-[180px]">
                    <FormSubmitButton
                      text="Change password"
                      disabled={isSubmitDisabled}
                    />
                  </div>
                </Form>
              );
            }}
          </Formik>
        </SettingsCard>
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
