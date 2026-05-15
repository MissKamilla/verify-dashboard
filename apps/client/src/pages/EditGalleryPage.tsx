import { useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { Form, Formik } from "formik";
import { useQueryClient } from "@tanstack/react-query";

import burgerIconUrl from "@/assets/icons/burger.svg";

import type { AuthenticatedLayoutContext } from "@/components/AuthenticatedLayout";

import { GalleryFields } from "@/features/gallery/components/GalleryFields";
import {
  galleryQueryKeys,
  useGalleryQuery,
  useUpdateGalleryMutation,
} from "@/features/gallery/galleryQueries";
import type { GalleryFormValues } from "@/features/gallery/types";
import { getGalleryPageState } from "@/features/gallery/getGalleryPageState";
import { validateGalleryForm } from "@/features/gallery/validateGalleryForm";

import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";

import { FormSubmitButton } from "@/shared/ui/FormSubmitButton";
import { Icon } from "@/shared/ui/Icon";

export function EditGalleryPage() {
  const [apiError, setApiError] = useState("");
  const { galleryId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { openMobileSidebar } = useOutletContext<AuthenticatedLayoutContext>();

  const numericGalleryId = Number(galleryId);
  const isValidGalleryId =
    Number.isInteger(numericGalleryId) && numericGalleryId > 0;

  const {
    data: gallery,
    error,
    isPending,
    isError,
    isFetching,
  } = useGalleryQuery(numericGalleryId, isValidGalleryId);

  const updateGalleryMutation = useUpdateGalleryMutation();

  const handleRetry = () => {
    void queryClient.invalidateQueries({
      queryKey: galleryQueryKeys.detail(numericGalleryId),
    });
  };

  const galleryPageState = getGalleryPageState({
    isValidGalleryId,
    isPending,
    isError: isError || !gallery,
    error,
    isFetching,
    onRetry: handleRetry,
  });

  if (galleryPageState) {
    return galleryPageState;
  }
  if (!gallery) {
    return null;
  }

  const editGalleryInitialValues: GalleryFormValues = {
    title: gallery.title,
    description: gallery.description,
  };

  return (
    <section className="flex min-h-[calc(100vh-60px)] flex-col">
      <header className="mb-[13px] flex min-h-[94px] items-center justify-between gap-[16px] rounded-[16px] bg-page-bg/50 backdrop-blur-[20px]">
        <h1 className="text-[32px] font-bold leading-[150%] text-text-main">
          Edit gallery
        </h1>

        <button
          type="button"
          className="hidden h-[50px] w-[180px] cursor-pointer items-center justify-center rounded-[16px] bg-brand text-[16px] font-bold leading-[150%] text-white hover:bg-avatar active:bg-brand-active lg:flex"
        >
          Upload photos
        </button>

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
          Edit Description
        </h2>

        <p className="mt-[8px] text-[16px] leading-[150%] text-text-secondary">
          You can edit description for your gallery.
        </p>

        <Formik<GalleryFormValues>
          initialValues={editGalleryInitialValues}
          validate={validateGalleryForm}
          validateOnMount
          onSubmit={(values) => {
            setApiError("");

            updateGalleryMutation.mutate(
              {
                id: numericGalleryId,
                payload: {
                  title: values.title.trim(),
                  description: values.description.trim(),
                },
              },
              {
                onSuccess: () => {
                  navigate(`/galleries/${numericGalleryId}`);
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
              updateGalleryMutation.isPending;

            return (
              <Form noValidate className="mt-[30px] flex min-h-full flex-col">
                <div className="grid gap-[30px] xl:grid-cols-[400px_1fr]">
                  <GalleryFields />

                  <div className="hidden grid-cols-3 gap-[20px] self-start xl:grid">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex min-h-[220px] flex-col rounded-[16px] border border-border-default p-[14px]"
                      >
                        <div className="mb-[12px] flex h-[100px] items-center justify-center rounded-[12px] bg-brand-light text-[14px] font-bold leading-[150%] text-border-default">
                          Photo
                        </div>

                        <div className="flex flex-col gap-[8px]">
                          <div className="h-[38px] rounded-[10px] border border-border-default" />
                          <div className="h-[58px] rounded-[10px] border border-border-default" />
                        </div>
                      </div>
                    ))}
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
                  <div className="w-full lg:w-[220px]">
                    <FormSubmitButton
                      text={
                        updateGalleryMutation.isPending
                          ? "Saving..."
                          : "Save changes"
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
