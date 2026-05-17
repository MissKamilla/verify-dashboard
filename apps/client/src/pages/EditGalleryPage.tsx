import { useState } from "react";
import { useOutletContext, useParams } from "react-router";
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
import { GalleryStatusAlerts } from "@/features/gallery/components/GalleryStatusAlerts";
import { GalleryEditPhotoCardPlaceholder } from "@/features/gallery/components/GalleryEditPhotoCardPlaceholder";
import { useGalleryScrollThumb } from "@/features/gallery/hooks/useGalleryScrollThumb";
import { GalleryActionLink } from "@/features/gallery/components/GalleryActionLink";
import { GalleryBackLink } from "@/features/gallery/components/GalleryBackLink";

import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";
import { FormSubmitButton } from "@/shared/ui/FormSubmitButton";
import { Icon } from "@/shared/ui/Icon";
import { CopyrightFooter } from "@/shared/ui/CopyrightFooter";

const EDIT_PHOTOS_PLACEHOLDER_COUNT = 4;

export function EditGalleryPage() {
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { galleryId } = useParams();

  const queryClient = useQueryClient();
  const { openMobileSidebar } = useOutletContext<AuthenticatedLayoutContext>();
  const { scrollContainerRef, scrollThumb, updateScrollThumb } =
    useGalleryScrollThumb(EDIT_PHOTOS_PLACEHOLDER_COUNT, 166);

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
    <section className="flex h-[calc(100vh-60px)] min-h-0 flex-col overflow-hidden">
      <header className="mb-[13px] flex min-h-[94px] shrink-0 items-center justify-between gap-4 rounded-2xl bg-page-bg/50 backdrop-blur-[20px] ">
        <h1 className="text-2xl font-bold leading-normal text-text-main md:text-[32px]">
          Edit gallery
        </h1>

        <GalleryActionLink
          to={`/galleries/${numericGalleryId}/upload-photos`}
          label="Upload photos"
          className="group hidden h-[50px] w-[250px] text-sm leading-none lg:flex"
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
        to={`/galleries/${numericGalleryId}/upload-photos`}
        label="Upload photos"
        className="group mt-5 flex h-[50px] w-full shrink-0 text-sm leading-none lg:hidden"
      />

      <Formik<GalleryFormValues>
        initialValues={editGalleryInitialValues}
        validate={validateGalleryForm}
        validateOnMount
        onSubmit={(values, { resetForm }) => {
          setApiError("");
          setSuccessMessage("");

          const updatedValues = {
            title: values.title.trim(),
            description: values.description.trim(),
          };

          updateGalleryMutation.mutate(
            {
              id: numericGalleryId,
              payload: updatedValues,
            },
            {
              onSuccess: () => {
                resetForm({ values: updatedValues });
                setSuccessMessage("Gallery changes have been saved.");
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
            <Form
              noValidate
              className="relative min-h-0 flex-1 overflow-hidden rounded-[30px] bg-white shadow-card"
            >
              <GalleryStatusAlerts
                successMessage={successMessage}
                errorMessage={apiError}
                onCloseSuccess={() => setSuccessMessage("")}
                onCloseError={() => setApiError("")}
              />

              <div className="scrollbar-gallery flex h-full flex-col overflow-y-auto px-5 py-10 pb-10 sm:p-[30px] sm:pb-10 min-[1360px]:overflow-hidden">
                <div className="relative mx-auto flex w-full max-w-[311px] flex-col min-[1360px]:min-h-0 min-[1360px]:flex-1 min-[1360px]:max-w-[900px] min-[1536px]:max-w-[950px]">
                  <h2 className="shrink-0 text-2xl font-bold leading-normal text-text-main">
                    Edit Description
                  </h2>
                  <p className="mt-2 shrink-0 text-base leading-normal text-text-secondary">
                    You can edit description for your gallery.
                  </p>
                  <div className="mt-[30px] grid w-full gap-[30px] min-[1360px]:min-h-0 min-[1360px]:flex-1 min-[1360px]:grid-cols-[330px_548px] min-[1360px]:gap-10 min-[1536px]:grid-cols-[330px_604px]">
                    <div className="shrink-0">
                      <GalleryFields />
                    </div>

                    <div className="relative min-[1360px]:min-h-0 min-[1360px]:overflow-hidden min-[1360px]:pr-[18px] min-[1536px]:pr-6">
                      <div
                        ref={scrollContainerRef}
                        onScroll={updateScrollThumb}
                        className="scrollbar-gallery min-[1360px]:h-full min-[1360px]:overflow-y-auto min-[1360px]:pb-[190px]"
                      >
                        <div className="flex w-full flex-col gap-5 pt-2 pr-[8px]">
                          {Array.from({
                            length: EDIT_PHOTOS_PLACEHOLDER_COUNT,
                          }).map((_, index) => (
                            <GalleryEditPhotoCardPlaceholder key={index} />
                          ))}
                        </div>
                      </div>

                      {scrollThumb.isVisible && (
                        <div className="pointer-events-none absolute bottom-[166px] right-0 top-0 z-20 hidden w-[3px] min-[1360px]:block">
                          <div
                            className="w-full rounded-sm bg-text-muted"
                            style={{
                              height: `${scrollThumb.height}px`,
                              transform: `translateY(${scrollThumb.top}px)`,
                            }}
                          />
                        </div>
                      )}

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden h-[166px] bg-gradient-to-b from-white/0 via-white/95 to-white min-[1360px]:block" />
                    </div>
                  </div>
                  <div className="z-30 mt-[30px] w-full max-w-[311px] min-[1360px]:absolute min-[1360px]:bottom-[30px] min-[1360px]:right-0 min-[1360px]:mt-0 min-[1360px]:w-[220px]">
                    <FormSubmitButton
                      text="Save changes"
                      disabled={isSubmitDisabled}
                    />
                  </div>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>

      <div className="mt-6 shrink-0 lg:flex lg:items-center lg:justify-between">
        <GalleryBackLink to="/galleries" />

        <CopyrightFooter className="lg:!mt-0 lg:!pt-0" />
      </div>
    </section>
  );
}
