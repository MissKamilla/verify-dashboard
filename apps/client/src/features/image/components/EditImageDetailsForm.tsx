import { useEffect, useState, type FormEvent } from "react";

import { FormInputField } from "@/shared/ui/FormInputField";
import { FormTextareaField } from "@/shared/ui/FormTextareaField";

import { MAX_IMAGE_COMMENT_LENGTH, MAX_IMAGE_NAME_LENGTH } from "../constants";
import type { GalleryImage, ImageMetafields } from "../types";

type EditImageDetailsFormProps = {
  image: GalleryImage;
  isSaving: boolean;
  error?: string;
  onSave: (metafields: ImageMetafields) => void;
  onClose: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

export function EditImageDetailsForm({
  image,
  isSaving,
  error,
  onSave,
  onClose,
  onDirtyChange,
}: EditImageDetailsFormProps) {
  const [name, setName] = useState(image.metafields.name ?? "");
  const [comment, setComment] = useState(image.metafields.comment ?? "");

  const initialName = image.metafields.name?.trim() ?? "";
  const initialComment = image.metafields.comment?.trim() ?? "";

  const isDirty =
    name.trim() !== initialName || comment.trim() !== initialComment;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSave({
      name: name.trim(),
      comment: comment.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2
        id="edit-image-details-title"
        className="text-center text-[28px] font-bold leading-normal text-text-main"
      >
        Edit details
      </h2>

      <p
        id="edit-image-details-description"
        className="mt-[18px] text-center text-lg font-normal leading-normal text-text-secondary"
      >
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
          maxLength={MAX_IMAGE_NAME_LENGTH}
          autoFocus
        />

        <FormTextareaField
          label="Comment"
          name="comment"
          placeholder="Type here..."
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          disabled={isSaving}
          maxLength={MAX_IMAGE_COMMENT_LENGTH}
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
          Save changes
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
