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
        <h1 className="text-[32px] font-bold leading-[150%] text-text-main">
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

      <div className="flex-1 rounded-[30px] bg-white p-[30px] shadow-card">
        <h2 className="text-[24px] font-bold leading-[150%] text-text-main">
          Upload Photos
        </h2>

        <p className="mt-[8px] text-[16px] leading-[150%] text-text-secondary">
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
              <Form noValidate className="mt-[30px] flex min-h-full flex-col">
                <div className="grid gap-[30px] xl:grid-cols-[400px_1fr]">
                  <div className="flex flex-col gap-[30px]">
                    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[24px] border border-dashed border-brand bg-brand-light px-[24px] py-[32px] text-center">
                      <p className="text-[18px] font-bold leading-[150%] text-text-muted">
                        Drag and drop photo here
                      </p>

                      <p className="mt-[10px] text-[14px] leading-[150%] text-text-muted">
                        JPEG, PNG (max 5MB / picture)
                      </p>

                      <div className="my-[22px] flex w-full items-center gap-[14px]">
                        <span className="h-px flex-1 bg-border-default" />
                        <span className="text-[16px] font-bold leading-[150%] text-text-muted">
                          OR
                        </span>
                        <span className="h-px flex-1 bg-border-default" />
                      </div>

                      <button
                        type="button"
                        className="h-[50px] w-full max-w-[260px] rounded-[16px] bg-brand text-[16px] font-bold leading-[150%] text-white hover:bg-avatar active:bg-brand-active"
                      >
                        Upload
                      </button>
                    </div>

                    <GalleryFields descriptionLabel="Description (optional)" />
                  </div>

                  <div className="hidden grid-cols-4 gap-[20px] self-start xl:grid">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex h-[140px] items-center justify-center rounded-[16px] border border-border-default text-[14px] font-bold leading-[150%] text-border-default"
                      >
                        Photo preview
                      </div>
                    ))}

                    <p className="col-span-4 text-[16px] leading-[150%] text-text-secondary">
                      Upload a maximum of <b>50 photos</b>, no more than{" "}
                      <b>5MB</b> each.
                    </p>
                  </div>
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

                <div className="mt-auto flex justify-end pt-[30px]">
                  <div className="w-full lg:w-[300px]">
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
    </section>
  );
}
