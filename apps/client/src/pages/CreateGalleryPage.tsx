import { useState } from "react";
import { useOutletContext } from "react-router";
import { Form, Formik } from "formik";

import burgerIconUrl from "@/assets/icons/burger.svg";

import type { AuthenticatedLayoutContext } from "@/components/AuthenticatedLayout";

import { GalleryFields } from "@/features/gallery/components/GalleryFields";
import { useCreateGalleryMutation } from "@/features/gallery/galleryQueries";
import type { GalleryFormValues } from "@/features/gallery/types";
import { validateGalleryForm } from "@/features/gallery/validateGalleryForm";
import { GalleryActionLink } from "@/features/gallery/components/GalleryActionLink";
import {
  ALLOWED_IMAGE_FORMATS_LABEL,
  MAX_IMAGE_SIZE_LABEL,
  MAX_IMAGES_PER_GALLERY,
} from "@/features/image/constants";

import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";
import { FormSubmitButton } from "@/shared/ui/FormSubmitButton";
import { Icon } from "@/shared/ui/Icon";
import { CopyrightFooter } from "@/shared/ui/CopyrightFooter";
import { PhotoPreviewPlaceholderGrid } from "@/shared/ui/PhotoPreviewPlaceholderGrid";
import { StatusAlerts } from "@/shared/ui/StatusAlerts";
import { UploadDropzonePlaceholder } from "@/shared/ui/UploadDropzonePlaceholder";

const createGalleryInitialValues: GalleryFormValues = {
  title: "",
  description: "",
};

export function CreateGalleryPage() {
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { openMobileSidebar } = useOutletContext<AuthenticatedLayoutContext>();

  const createGalleryMutation = useCreateGalleryMutation();

  return (
    <section className="flex h-[calc(100vh-60px)] min-h-0 flex-col overflow-hidden">
      <header className="mb-[13px] flex min-h-[94px] shrink-0 items-center justify-between gap-4 rounded-2xl bg-page-bg/50 backdrop-blur-[20px]">
        <h1 className="text-2xl font-bold leading-normal text-text-main md:text-[32px]">
          Create a new gallery
        </h1>

        <GalleryActionLink
          to="/galleries"
          label="Go to gallery list"
          className="hidden min-h-[50px] w-[220px] shrink-0 text-base leading-normal active:bg-brand-active lg:flex"
        />

        <button
          type="button"
          onClick={openMobileSidebar}
          className="flex h-10 w-10 cursor-pointer items-center justify-center lg:hidden"
          aria-label="Open menu"
        >
          <Icon src={burgerIconUrl} className="h-6 w-6" />
        </button>
      </header>

      <GalleryActionLink
        to="/galleries"
        label="Go to gallery list"
        className="mb-[13px] flex min-h-[50px] w-full shrink-0 text-base leading-normal active:bg-brand-active lg:hidden"
      />

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[30px] bg-white shadow-card">
        <StatusAlerts
          successMessage={successMessage}
          errorMessage={apiError}
          onCloseSuccess={() => setSuccessMessage("")}
          onCloseError={() => setApiError("")}
        />

        <div className="h-full w-full overflow-y-auto p-[30px] pb-10 lg:pb-[50px]">
          <div className="mx-auto flex min-h-full w-full max-w-[1200px] flex-col">
            <div className="mx-auto w-full max-w-[330px] min-[900px]:mx-0 min-[900px]:max-w-none">
              <h2 className="text-left text-2xl font-bold leading-normal text-text-main">
                Upload Photos
              </h2>

              <p className="mt-2 text-left text-base leading-normal text-text-secondary">
                You can upload one photo or a set of photos.
              </p>
            </div>

            <Formik<GalleryFormValues>
              initialValues={createGalleryInitialValues}
              validate={validateGalleryForm}
              validateOnMount
              onSubmit={(values, { resetForm }) => {
                setApiError("");
                setSuccessMessage("");

                createGalleryMutation.mutate(
                  {
                    title: values.title.trim(),
                    description: values.description.trim(),
                  },
                  {
                    onSuccess: () => {
                      resetForm();
                      setSuccessMessage(
                        "A new gallery has been created in the gallery list.",
                      );
                    },
                    onError: (error) => {
                      setApiError(getApiErrorMessage(error));
                    },
                  },
                );
              }}
            >
              {({ values, isValid, dirty }) => {
                const isSubmitDisabled =
                  !dirty ||
                  !values.title.trim() ||
                  !isValid ||
                  createGalleryMutation.isPending;

                return (
                  <Form noValidate className="mt-[30px] flex flex-1 flex-col">
                    <div className="mx-auto grid w-full max-w-[330px] gap-[30px] min-[900px]:mx-0 min-[900px]:max-w-none min-[900px]:grid-cols-[330px_minmax(242px,1fr)] min-[900px]:justify-between">
                      <div className="flex flex-col gap-[30px]">
                        <UploadDropzonePlaceholder
                          allowedImageFormatsLabel={ALLOWED_IMAGE_FORMATS_LABEL}
                          maxImageSizeLabel={MAX_IMAGE_SIZE_LABEL}
                        />

                        <GalleryFields
                          descriptionLabel={
                            <>
                              Description{" "}
                              <span className="text-text-secondary">
                                (optional)
                              </span>
                            </>
                          }
                        />
                      </div>

                      <PhotoPreviewPlaceholderGrid
                        maxImages={MAX_IMAGES_PER_GALLERY}
                        maxImageSizeLabel={MAX_IMAGE_SIZE_LABEL}
                      />
                    </div>

                    <div className="mt-auto flex justify-center pt-[30px] min-[900px]:justify-end">
                      <div className="w-full max-w-[311px] sm:max-w-[330px] min-[900px]:max-w-[300px]">
                        <FormSubmitButton
                          text={
                            createGalleryMutation.isPending
                              ? "Creating..."
                              : "Create a new gallery"
                          }
                          disabled={isSubmitDisabled}
                        />
                      </div>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      </div>

      <CopyrightFooter />
    </section>
  );
}
