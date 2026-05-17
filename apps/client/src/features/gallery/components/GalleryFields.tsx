import type { ReactNode } from "react";
import { useFormikContext } from "formik";

import type { GalleryFormValues } from "@/features/gallery/types";

import { FormInputField } from "@/shared/ui/FormInputField";
import { FormTextareaField } from "@/shared/ui/FormTextareaField";

type GalleryFieldsProps = {
  descriptionLabel?: ReactNode;
  titlePlaceholder?: string;
  descriptionPlaceholder?: string;
};

export function GalleryFields({
  descriptionLabel = "Description",
  titlePlaceholder = "Gallery name",
  descriptionPlaceholder = "Type here...",
}: GalleryFieldsProps) {
  const { values, errors, touched, handleChange, handleBlur } =
    useFormikContext<GalleryFormValues>();

  return (
    <div className="flex w-full max-w-[311px] flex-col gap-4 sm:max-w-[330px]">
      <FormInputField
        label="Gallery name"
        name="title"
        placeholder={titlePlaceholder}
        value={values.title}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.title ? errors.title : undefined}
      />

      <FormTextareaField
        label={descriptionLabel}
        name="description"
        placeholder={descriptionPlaceholder}
        value={values.description}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.description ? errors.description : undefined}
      />
    </div>
  );
}
