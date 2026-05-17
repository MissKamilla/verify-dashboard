import { useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router";
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

export function EditGalleryPage() {
  const [apiError, setApiError] = useState("");
  const { galleryId } = useParams();
  const navigate = useNavigate();
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
    <section className="flex min-h-[calc(100vh-60px)] flex-col min-[1360px]:h-[calc(100vh-60px)] min-[1360px]:min-h-0 min-[1360px]:overflow-hidden">
      <header className="mb-[13px] flex min-h-[94px] shrink-0 items-center justify-between gap-[16px] rounded-[16px] bg-page-bg/50 backdrop-blur-[20px] ">
        <h1 className="text-[24px] font-bold leading-[150%] text-text-main md:text-[32px]">
          Edit gallery
        </h1>

        <Link
          to={`/galleries/${numericGalleryId}/upload-photos`}
          onClick={(event) => event.preventDefault()}
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
        onClick={(event) => event.preventDefault()}
        className="group mt-[20px] flex h-[50px] w-full cursor-pointer items-center justify-center gap-[10px] rounded-[16px] border border-brand text-[14px] font-bold leading-none text-brand transition-colors hover:border-avatar hover:bg-avatar hover:text-white lg:hidden"
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
            <Form
              noValidate
              className="relative flex flex-col rounded-[30px] bg-white px-[20px] py-[40px] shadow-card sm:p-[30px] min-[1360px]:min-h-0 min-[1360px]:flex-1 min-[1360px]:overflow-hidden"
            >
              <div className="relative mx-auto flex w-full max-w-[311px] flex-col min-[1360px]:min-h-0 min-[1360px]:flex-1 min-[1360px]:max-w-[900px] min-[1536px]:max-w-[950px]">
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

                {apiError && (
                  <p
                    role="alert"
                    aria-live="polite"
                    className="mt-[20px] shrink-0 text-[12px] font-normal leading-[24px] text-error"
                  >
                    {apiError}
                  </p>
                )}

                <div className="z-30 mt-[30px] w-full max-w-[311px] min-[1360px]:absolute min-[1360px]:bottom-[30px] min-[1360px]:right-0 min-[1360px]:mt-0 min-[1360px]:w-[220px]">
                  <FormSubmitButton
                    text="Save changes"
                    disabled={isSubmitDisabled}
                  />
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>

      <div className="mt-[24px] flex shrink-0 items-center justify-between">
        <Link
          to="/galleries"
          className="flex items-center gap-[8px] text-[16px] font-bold leading-[150%] text-text-main hover:text-brand"
        >
          <Icon
            src={arrowRightIconUrl}
            className="h-[12px] w-[15px] rotate-180"
          />
          <span>Back</span>
        </Link>

        <CopyrightFooter />
      </div>
    </section>
  );
}
