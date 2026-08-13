import { useState } from "react";
import { Form, Formik, type FormikHelpers, useFormikContext } from "formik";

import {
  useCreateGalleryAccessMutation,
  useGalleryAccessRecipientQuery,
} from "@/features/gallery/galleryQueries";
import type {
  GalleryAccessFormValues,
  GalleryAccessRole,
} from "@/features/gallery/types";
import { validateGalleryAccessForm } from "@/features/gallery/validateGalleryAccessForm";

import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";
import { isValidEmail } from "@/shared/lib/validationRules";
import { Dropdown, type DropdownOption } from "@/shared/ui/Dropdown";
import { FormInputField } from "@/shared/ui/FormInputField";
import { FormSubmitButton } from "@/shared/ui/FormSubmitButton";
import { SettingsCard } from "@/shared/ui/SettingsCard";

type GalleryAccessFormProps = {
  galleryId: number;
};

type GalleryAccessFormContentProps = {
  galleryId: number;
  apiError: string;
  sendNotification: boolean;
  setApiError: (value: string) => void;
  setSendNotification: (value: boolean) => void;
  isCreatingAccess: boolean;
};

const initialValues: GalleryAccessFormValues = {
  email: "",
  role: "viewer",
};

const roleOptions: DropdownOption<GalleryAccessRole>[] = [
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
  const [sendNotification, setSendNotification] = useState(false);

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
          role: values.role,
          sendNotification,
        },
      });

      resetForm();
      setSendNotification(false);
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
        <GalleryAccessFormContent
          galleryId={galleryId}
          apiError={apiError}
          sendNotification={sendNotification}
          setApiError={setApiError}
          setSendNotification={setSendNotification}
          isCreatingAccess={createAccessMutation.isPending}
        />
      </Formik>
    </SettingsCard>
  );
}

function GalleryAccessFormContent({
  galleryId,
  apiError,
  sendNotification,
  setApiError,
  setSendNotification,
  isCreatingAccess,
}: GalleryAccessFormContentProps) {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    isSubmitting,
  } = useFormikContext<GalleryAccessFormValues>();

  const trimmedEmail = values.email.trim();
  const isEmailValid = isValidEmail(trimmedEmail);

  const recipientQuery = useGalleryAccessRecipientQuery(
    galleryId,
    trimmedEmail,
    isEmailValid,
  );

  const isUnregisteredUser =
    isEmailValid && recipientQuery.data?.registered === false;

  const isCheckingRecipient = isEmailValid && recipientQuery.isPending;

  const isDisabled = isCreatingAccess || isSubmitting || isCheckingRecipient;

  const isNotificationChecked = isUnregisteredUser || sendNotification;

  return (
    <Form noValidate className="flex flex-col gap-4">
      <FormInputField
        label="Email"
        type="email"
        name="email"
        value={values.email}
        onChange={(event) => {
          handleChange(event);
          setApiError("");
        }}
        onBlur={handleBlur}
        error={touched.email ? errors.email : undefined}
        placeholder="user@example.com"
        autoComplete="email"
        disabled={isDisabled}
        required
      />

      <div
        aria-hidden={!isEmailValid}
        className={`grid transition-[grid-template-rows,opacity,margin-top] duration-300 ease-out ${
          isEmailValid
            ? "mt-4 grid-rows-[1fr] opacity-100"
            : "pointer-events-none mt-0 grid-rows-[0fr] opacity-0"
        }`}
      >
        <div
          className={`min-h-0 ${
            isEmailValid ? "overflow-visible" : "overflow-hidden"
          }`}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="min-w-0 flex-1">
              <label className="mb-2 block text-sm font-medium leading-none text-text-main">
                Role
              </label>

              <Dropdown
                value={values.role}
                options={roleOptions}
                ariaLabel="Select user role"
                disabled={isDisabled || !isEmailValid}
                onChange={(role) => {
                  setApiError("");
                  void setFieldValue("role", role);
                }}
              />
            </div>

            <label className="group flex min-h-[50px] cursor-pointer items-center gap-3 text-sm text-text-main">
              <input
                type="checkbox"
                checked={isNotificationChecked}
                disabled={isDisabled || !isEmailValid || isUnregisteredUser}
                onChange={(event) => setSendNotification(event.target.checked)}
                className="peer sr-only"
              />
              <span className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-border-default bg-white transition-colors peer-checked:border-brand peer-checked:bg-brand peer-disabled:opacity-60 group-hover:border-brand">
                <span className="absolute left-1/2 top-1/2 h-2.5 w-1.5 -translate-x-1/2 -translate-y-[60%] rotate-45 border-b-2 border-r-2 border-white opacity-0 transition-opacity group-has-[:checked]:opacity-100" />
              </span>
              Send notification
            </label>
          </div>

          {apiError && (
            <p
              role="alert"
              aria-live="polite"
              className="mt-4 text-sm text-error"
            >
              {apiError}
            </p>
          )}

          <div className="mt-4 ml-auto w-full md:w-[180px]">
            <FormSubmitButton
              text="Share"
              disabled={isDisabled || !isEmailValid}
            />
          </div>
        </div>
      </div>
    </Form>
  );
}
