import { useState, type FormEvent } from "react";

import closeIconUrl from "@/assets/icons/close.svg";

import { FormInputField } from "@/shared/ui/FormInputField";
import { FormTextareaField } from "@/shared/ui/FormTextareaField";
import { Icon } from "@/shared/ui/Icon";

import type { GalleryImage, ImageMetafields } from "../types";

type EditImageDetailsFormProps = {
  image: GalleryImage;
  isSaving: boolean;
  error?: string;
  onSave: (metafields: ImageMetafields) => void;
  onClose: () => void;
};

export function EditImageDetailsForm({
  image,
  isSaving,
  error,
  onSave,
  onClose,
}: EditImageDetailsFormProps) {
  const [name, setName] = useState(image.metafields.name ?? "");
  const [comment, setComment] = useState(image.metafields.comment ?? "");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSave({
      name: name.trim(),
      comment: comment.trim(),
    });
  };

  return (
    <form
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-image-details-title"
      className="relative w-full max-w-[438px] rounded-2xl bg-white px-8 pb-8 pt-[46px]"
      onClick={(event) => event.stopPropagation()}
      onSubmit={handleSubmit}
      noValidate
    >
      <button
        type="button"
        onClick={onClose}
        disabled={isSaving}
        className="absolute right-6 top-6 flex h-6 w-6 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Close modal"
      >
        <Icon src={closeIconUrl} className="h-4 w-4 text-text-main" />
      </button>

      <h2
        id="edit-image-details-title"
        className="text-center text-[28px] font-bold leading-normal text-text-main"
      >
        Edit details
      </h2>

      <p className="mt-[18px] text-center text-lg font-normal leading-normal text-text-secondary">
        Here you can add or change details.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <FormInputField
          label="Name"
          name="name"
          placeholder="Photo name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isSaving}
          maxLength={100}
          autoFocus
        />

        <FormTextareaField
          label="Comment"
          name="comment"
          placeholder="Type here..."
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          disabled={isSaving}
          maxLength={500}
        />
      </div>

      {error && (
        <p
          role="alert"
          aria-live="polite"
          className="mt-4 text-xs font-normal leading-6 text-error"
        >
          {error}
        </p>
      )}

      <div className="mt-7 flex flex-col gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="h-[50px] w-full rounded-2xl bg-brand text-base font-bold leading-none text-white hover:bg-avatar active:bg-brand-active disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save changes"}
        </button>

        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="h-[50px] w-full rounded-2xl text-base font-bold leading-none text-text-main disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
