import { useState } from "react";
import { Form, Formik, type FormikHelpers } from "formik";

import { useCreateGalleryAccessMutation } from "@/features/gallery/galleryQueries";
import type {
  GalleryAccessFormValues,
  GalleryAccessRole,
} from "@/features/gallery/types";
import { validateGalleryAccessForm } from "@/features/gallery/validateGalleryAccessForm";

import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";
import { Dropdown, type DropdownOption } from "@/shared/ui/Dropdown";
import { FormInputField } from "@/shared/ui/FormInputField";
import { FormSubmitButton } from "@/shared/ui/FormSubmitButton";
import { SettingsCard } from "@/shared/ui/SettingsCard";

type GalleryAccessFormProps = {
  galleryId: number;
};

const initialValues: GalleryAccessFormValues = {
  email: "",
  role: "",
};

const roleOptions: DropdownOption<GalleryAccessFormValues["role"]>[] = [
  {
    value: "editor",
    label: "Editor",
  },
  {
    value: "viewer",
    label: "Viewer",
  },
];

export function GalleryAccessForm({ galleryId }: GalleryAccessFormProps) {
  const [apiError, setApiError] = useState("");

  const createAccessMutation = useCreateGalleryAccessMutation();

  const handleSubmit = async (
    values: GalleryAccessFormValues,
    { resetForm }: FormikHelpers<GalleryAccessFormValues>,
  ) => {
    if (!values.role) {
      return;
    }

    setApiError("");

    try {
      await createAccessMutation.mutateAsync({
        galleryId,
        payload: {
          email: values.email.trim(),
          role: values.role as GalleryAccessRole,
        },
      });

      resetForm();
    } catch (error) {
      setApiError(getApiErrorMessage(error));
    }
  };

  return (
    <SettingsCard
      title="Grant access"
      description="Share this gallery with another registered user."
    >
      <Formik<GalleryAccessFormValues>
        initialValues={initialValues}
        validate={validateGalleryAccessForm}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          setFieldValue,
          setFieldTouched,
          isSubmitting,
        }) => {
          const isDisabled = createAccessMutation.isPending || isSubmitting;

          return (
            <Form noValidate className="flex flex-col gap-6">
              <FormInputField
                label="Email"
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email ? errors.email : undefined}
                placeholder="user@example.com"
                autoComplete="email"
                disabled={isDisabled}
                required
              />

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium leading-none text-text-main">
                  Role <span className="text-error">*</span>
                </label>

                <Dropdown
                  value={values.role}
                  options={roleOptions}
                  placeholder="Select a role"
                  ariaLabel="Select user role"
                  disabled={isDisabled}
                  onChange={(role) => {
                    void setFieldValue("role", role);
                    void setFieldTouched("role", true, false);
                  }}
                />

                {touched.role && errors.role && (
                  <p
                    role="alert"
                    className="text-xs font-normal leading-6 text-error"
                  >
                    {errors.role}
                  </p>
                )}
              </div>

              {apiError && (
                <p
                  role="alert"
                  aria-live="polite"
                  className="text-sm text-error"
                >
                  {apiError}
                </p>
              )}

              <div className="ml-auto w-full lg:w-[180px]">
                <FormSubmitButton
                  text={isDisabled ? "Granting..." : "Grant access"}
                  disabled={isDisabled}
                />
              </div>
            </Form>
          );
        }}
      </Formik>
    </SettingsCard>
  );
}
