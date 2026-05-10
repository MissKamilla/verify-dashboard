import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik, type FormikHelpers } from "formik";

import { FormSubmitButton } from "@/shared/ui/FormSubmitButton";
import { PasswordInputField } from "@/shared/ui/PasswordInputField";
import { SettingsCard } from "@/shared/ui/SettingsCard";

import { getApiErrorMessage } from "@/features/auth/getApiErrorMessage";
import type { ChangePasswordFormValues } from "@/features/profile/types";
import { validateChangePasswordForm } from "@/features/profile/validateChangePasswordForm";
import { updateProfile } from "@/features/profile/profileApi";

type ChangePasswordFormProps = {
  onSuccess: () => void;
};
const changePasswordInitialValues: ChangePasswordFormValues = {
  oldPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const [passwordApiError, setPasswordApiError] = useState("");

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

  const changePasswordMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      setPasswordApiError("");
      onSuccess();
    },
    onError: (error) => {
      setPasswordApiError(getApiErrorMessage(error));
    },
  });

  return (
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
  );
}
