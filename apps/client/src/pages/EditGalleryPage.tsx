import { useState } from "react";
import { Link, useOutletContext, useParams } from "react-router";
import { Form, Formik } from "formik";
import { useQueryClient } from "@tanstack/react-query";

import burgerIconUrl from "@/assets/icons/burger.svg";
import arrowRightIconUrl from "@/assets/icons/arrow-right.svg";

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
import { GalleryEditPhotoCardPlaceholder } from "@/features/gallery/components/GalleryEditPhotoCardPlaceholder";
import { useGalleryScrollThumb } from "@/features/gallery/hooks/useGalleryScrollThumb";
import { CopyrightFooter } from "@/shared/ui/CopyrightFooter";
import { StatusAlert } from "@/shared/ui/StatusAlert";

export function EditGalleryPage() {
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { galleryId } = useParams();

  const queryClient = useQueryClient();
  const { openMobileSidebar } = useOutletContext<AuthenticatedLayoutContext>();
  const { scrollContainerRef, scrollThumb, updateScrollThumb } =
    useGalleryScrollThumb(3, 166);

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
      <header className="mb-[13px] flex min-h-[94px] shrink-0 items-center justify-between gap-[16px] rounded-[16px] bg-page-bg/50 backdrop-blur-[20px] ">
        <h1 className="text-[24px] font-bold leading-[150%] text-text-main md:text-[32px]">
          Edit gallery
        </h1>

        <Link
          to={`/galleries/${numericGalleryId}/upload-photos`}
          className="group hidden h-[50px] w-[250px] cursor-pointer items-center justify-center gap-[10px] rounded-[16px] border border-brand text-[14px] font-bold leading-none text-brand transition-colors hover:border-avatar hover:bg-avatar hover:text-white lg:flex"
        >
          <span>Upload photos</span>
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
        to={`/galleries/${numericGalleryId}/upload-photos`}
        className="group mt-[20px] flex h-[50px] w-full shrink-0 cursor-pointer items-center justify-center gap-[10px] rounded-[16px] border border-brand text-[14px] font-bold leading-none text-brand transition-colors hover:border-avatar hover:bg-avatar hover:text-white lg:hidden"
      >
        <span>Upload photos</span>
        <Icon
          src={arrowRightIconUrl}
          className="h-[12px] w-[15px] text-current"
        />
      </Link>

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
              {successMessage && (
                <div className="absolute top-[30px] right-[30px] left-[30px] z-40 min-[900px]:left-auto min-[900px]:w-[550px]">
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
                <div className="absolute top-[30px] right-[30px] left-[30px] z-40 min-[900px]:left-auto min-[900px]:w-[550px]">
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

              <div className="scrollbar-gallery flex h-full flex-col overflow-y-auto px-[20px] py-[40px] pb-[40px] sm:p-[30px] sm:pb-[40px] min-[1360px]:overflow-hidden">
                <div className="relative mx-auto flex w-full max-w-[311px] flex-col min-[1360px]:min-h-0 min-[1360px]:flex-1 min-[1360px]:max-w-[900px] min-[1536px]:max-w-[950px]">
                  {" "}
                  <h2 className="shrink-0 text-[24px] font-bold leading-[150%] text-text-main">
                    Edit Description
                  </h2>
                  <p className="mt-[8px] shrink-0 text-[16px] leading-[150%] text-text-secondary">
                    You can edit description for your gallery.
                  </p>
                  <div className="mt-[30px] grid w-full gap-[30px] min-[1360px]:min-h-0 min-[1360px]:flex-1 min-[1360px]:grid-cols-[330px_548px] min-[1360px]:gap-[40px] min-[1536px]:grid-cols-[330px_604px]">
                    <div className="shrink-0">
                      <GalleryFields />
                    </div>

                    <div className="relative min-[1360px]:min-h-0 min-[1360px]:overflow-hidden min-[1360px]:pr-[18px] min-[1536px]:pr-[24px]">
                      <div
                        ref={scrollContainerRef}
                        onScroll={updateScrollThumb}
                        className="scrollbar-gallery min-[1360px]:h-full min-[1360px]:overflow-y-auto min-[1360px]:pb-[190px]"
                      >
                        <div className="flex w-full flex-col gap-[20px] pt-[8px] pr-[8px]">
                          {Array.from({ length: 4 }).map((_, index) => (
                            <GalleryEditPhotoCardPlaceholder key={index} />
                          ))}
                        </div>
                      </div>

                      {scrollThumb.isVisible && (
                        <div className="pointer-events-none absolute bottom-[166px] right-0 top-0 z-20 hidden w-[3px] min-[1360px]:block">
                          <div
                            className="w-full rounded-[2px] bg-text-muted"
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

      <div className="mt-[24px] shrink-0 lg:flex lg:items-center lg:justify-between">
        <Link
          to="/galleries"
          className="inline-flex items-center gap-[8px] text-[16px] font-bold leading-[150%] text-text-main hover:text-brand"
        >
          <Icon
            src={arrowRightIconUrl}
            className="h-[12px] w-[15px] rotate-180 text-current"
          />
          <span>Back</span>
        </Link>

        <CopyrightFooter className="lg:!mt-0 lg:!pt-0" />
      </div>
    </section>
  );
}
