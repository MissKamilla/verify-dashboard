import { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router";
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

const createGalleryInitialValues: GalleryFormValues = {
  title: "",
  description: "",
};

export function CreateGalleryPage() {
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();
  const { openMobileSidebar } = useOutletContext<AuthenticatedLayoutContext>();

  const createGalleryMutation = useCreateGalleryMutation();

  return (
    <section className="flex min-h-[calc(100vh-60px)] flex-col">
      <header className="mb-[13px] flex min-h-[94px] items-center justify-between gap-[16px] rounded-[16px] bg-page-bg/50 backdrop-blur-[20px]">
        <h1 className="text-[24px] font-bold leading-[150%] text-text-main md:text-[32px]">
          Create a new gallery
        </h1>

        <Link
          to="/galleries"
          className="hidden h-[50px] w-[220px] cursor-pointer items-center justify-center gap-[10px] rounded-[16px] border border-brand text-[16px] font-bold leading-[150%] text-brand lg:flex"
        >
          <span>Go to gallery list</span>
          <Icon
            src={arrowRightIconUrl}
            className="h-[12px] w-[15px] text-brand"
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
        className="mb-[13px] flex h-[50px] w-full cursor-pointer items-center justify-center gap-[10px] rounded-[16px] border border-brand text-[16px] font-bold leading-[150%] text-brand lg:hidden"
      >
        <span>Go to gallery list</span>
        <Icon
          src={arrowRightIconUrl}
          className="h-[12px] w-[15px] text-brand"
        />
      </Link>

      <div className="flex flex-1 rounded-[30px] bg-white p-[30px] shadow-card">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col">
          <h2 className="text-center text-[24px] font-bold leading-[150%] text-text-main min-[900px]:text-left">
            Upload Photos
          </h2>

          <p className="mt-[8px] text-center text-[16px] leading-[150%] text-text-secondary min-[900px]:text-left">
            You can upload one photo or a set of photos.
          </p>

          <Formik<GalleryFormValues>
            initialValues={createGalleryInitialValues}
            validate={validateGalleryForm}
            validateOnMount
            onSubmit={(values) => {
              setApiError("");

              createGalleryMutation.mutate(
                {
                  title: values.title.trim(),
                  description: values.description.trim(),
                },
                {
                  onSuccess: () => {
                    navigate("/galleries");
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

                  {apiError && (
                    <p
                      role="alert"
                      aria-live="polite"
                      className="mt-[20px] text-[12px] font-normal leading-[24px] text-error"
                    >
                      {apiError}
                    </p>
                  )}

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
    </section>
  );
}
