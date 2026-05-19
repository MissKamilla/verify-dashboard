import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Formik } from "formik";

import companyIconUrl from "@/assets/icons/company.svg";
import profileIconUrl from "@/assets/icons/profile.svg";

import type {
  AccountSettingsFormValues,
  UserProfile,
} from "@/features/profile/types";
import { updateProfile } from "@/features/profile/profileApi";
import { profileQueryKey } from "@/features/profile/profileQueries";
import { validateAccountSettingsForm } from "@/features/profile/validateProfileForms";

import { FormInputField } from "@/shared/ui/FormInputField";
import { SettingsCard } from "@/shared/ui/SettingsCard";
import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";
import { Icon } from "@/shared/ui/Icon";
import { FormSubmitButton } from "@/shared/ui/FormSubmitButton";

type AccountSettingsFormProps = {
  profile: UserProfile;
  onSuccess: () => void;
};

export function AccountSettingsForm({
  profile,
  onSuccess,
}: AccountSettingsFormProps) {
  const [accountApiError, setAccountApiError] = useState("");
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedProfile) => {
      setAccountApiError("");
      queryClient.setQueryData(profileQueryKey, updatedProfile);
      onSuccess();
    },
    onError: (error) => {
      setAccountApiError(getApiErrorMessage(error));
    },
  });

  const accountInitialValues: AccountSettingsFormValues = {
    firstname: profile.firstname,
    lastname: profile.lastname,
  };

  return (
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
            <Form className="flex flex-col gap-6">
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
                    className="h-5 w-5 text-text-main"
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
                    className="h-5 w-5 text-text-main"
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
                    className="h-5 w-5 text-text-main"
                  />
                }
              />

              {accountApiError && (
                <p className="text-sm font-normal leading-normal text-error">
                  {accountApiError}
                </p>
              )}

              <div className="mx-auto mt-1 w-full lg:ml-auto lg:mr-0 lg:w-[180px]">
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
  );
}
