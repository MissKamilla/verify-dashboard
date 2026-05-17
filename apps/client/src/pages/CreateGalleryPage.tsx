import { useState } from "react";
import { Link, useOutletContext } from "react-router";
import { Form, Formik } from "formik";

import arrowRightIconUrl from "@/assets/icons/arrow-right.svg";
import burgerIconUrl from "@/assets/icons/burger.svg";

import type { AuthenticatedLayoutContext } from "@/components/AuthenticatedLayout";

import { GalleryFields } from "@/features/gallery/components/GalleryFields";
import { useCreateGalleryMutation } from "@/features/gallery/galleryQueries";
import type { GalleryFormValues } from "@/features/gallery/types";
import { validateGalleryForm } from "@/features/gallery/validateGalleryForm";

import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";
import { FormSubmitButton } from "@/shared/ui/FormSubmitButton";
import { Icon } from "@/shared/ui/Icon";
import { GalleryUploadDropzonePlaceholder } from "@/features/gallery/components/GalleryUploadDropzonePlaceholder";
import { GalleryPhotoPreviewPlaceholderGrid } from "@/features/gallery/components/GalleryPhotoPreviewPlaceholderGrid";
import { CopyrightFooter } from "@/shared/ui/CopyrightFooter";
import { StatusAlert } from "@/shared/ui/StatusAlert";

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
      <header className="mb-[13px] flex min-h-[94px] shrink-0 items-center justify-between gap-[16px] rounded-[16px] bg-page-bg/50 backdrop-blur-[20px]">
        <h1 className="text-[24px] font-bold leading-[150%] text-text-main md:text-[32px]">
          Create a new gallery
        </h1>

        <Link
          to="/galleries"
          className="hidden min-h-[50px] w-[220px] shrink-0 cursor-pointer items-center justify-center gap-[10px] rounded-[16px] border border-brand text-[16px] font-bold leading-[150%] text-brand transition-colors hover:border-avatar hover:bg-avatar hover:text-white active:bg-brand-active lg:flex"
        >
          <span>Go to gallery list</span>
          <Icon
            src={arrowRightIconUrl}
            className="h-[12px] w-[15px] text-current"
          />
        </Link>

        <button
          type="button"
          onClick={openMobileSidebar}
          className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center lg:hidden"
          aria-label="Open menu"
        >
          <Icon src={burgerIconUrl} className="h-[24px] w-[24px]" />
        </button>
      </header>

      <Link
        to="/galleries"
        className="mb-[13px] flex min-h-[50px] w-full shrink-0 cursor-pointer items-center justify-center gap-[10px] rounded-[16px] border border-brand text-[16px] font-bold leading-[150%] text-brand transition-colors hover:border-avatar hover:bg-avatar hover:text-white active:bg-brand-active lg:hidden"
      >
        <span>Go to gallery list</span>
        <Icon
          src={arrowRightIconUrl}
          className="h-[12px] w-[15px] text-current"
        />
      </Link>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[30px] bg-white shadow-card">
        {successMessage && (
          <div className="absolute top-[30px] right-[30px] left-[30px] z-30 min-[900px]:left-auto min-[900px]:w-[550px]">
            <StatusAlert
              variant="success"
              title="Success"
              onClose={() => setSuccessMessage("")}
              autoCloseMs={3000}
              tooltipText={successMessage}
            >
              {successMessage}
            </StatusAlert>
          </div>
        )}

        {apiError && (
          <div className="absolute top-[30px] right-[30px] left-[30px] z-30 min-[900px]:left-auto min-[900px]:w-[550px]">
            <StatusAlert
              variant="error"
              title="Error"
              onClose={() => setApiError("")}
              autoCloseMs={3000}
              tooltipText={apiError}
            >
              {apiError}
            </StatusAlert>
          </div>
        )}

        <div className="scrollbar-gallery h-full w-full overflow-y-auto p-[30px] pb-[40px] lg:pb-[50px]">
          <div className="mx-auto flex min-h-full w-full max-w-[1200px] flex-col">
            <div className="mx-auto w-full max-w-[330px] min-[900px]:mx-0 min-[900px]:max-w-none">
              <h2 className="text-left text-[24px] font-bold leading-[150%] text-text-main">
                Upload Photos
              </h2>

              <p className="mt-[8px] text-left text-[16px] leading-[150%] text-text-secondary">
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
                        <GalleryUploadDropzonePlaceholder />

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

                      <GalleryPhotoPreviewPlaceholderGrid />
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
