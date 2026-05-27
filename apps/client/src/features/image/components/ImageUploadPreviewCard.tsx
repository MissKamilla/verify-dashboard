import {
  MAX_IMAGE_COMMENT_LENGTH,
  MAX_IMAGE_NAME_LENGTH,
} from "../constants";

type ImageUploadPreviewCardProps = {
  id: string;
  previewUrl: string;
  name: string;
  comment: string;
  disabled?: boolean;
  onMetafieldChange: (
    imageId: string,
    field: "name" | "comment",
    value: string,
  ) => void;
};

export function ImageUploadPreviewCard({
  id,
  previewUrl,
  name,
  comment,
  disabled = false,
  onMetafieldChange,
}: ImageUploadPreviewCardProps) {
  const nameInputId = `upload-image-name-${id}`;
  const commentInputId = `upload-image-comment-${id}`;

  return (
    <div className="ml-auto grid w-full max-w-[330px] gap-4 min-[1440px]:max-w-[580px] min-[1440px]:grid-cols-[232px_minmax(0,328px)] min-[1440px]:gap-5">
      <div className="w-full overflow-hidden rounded-2xl">
        <img
          src={previewUrl}
          alt={name.trim() || "Selected photo"}
          className="aspect-square w-full object-cover"
        />
      </div>

      <div className="flex w-full flex-col gap-4">
        <label className="flex flex-col gap-2" htmlFor={nameInputId}>
          <span className="text-sm font-medium leading-none text-text-main">
            Name
          </span>

          <input
            id={nameInputId}
            type="text"
            value={name}
            onChange={(event) =>
              onMetafieldChange(id, "name", event.target.value)
            }
            maxLength={MAX_IMAGE_NAME_LENGTH}
            disabled={disabled}
            placeholder="Name"
            className="h-[50px] w-full rounded-2xl border border-border-default px-[18px] text-sm font-normal text-text-main outline-none placeholder:text-text-muted focus:border-brand disabled:cursor-not-allowed disabled:bg-border-light disabled:text-text-secondary"
          />
        </label>

        <label className="flex flex-col gap-2" htmlFor={commentInputId}>
          <span className="text-sm font-medium leading-none text-text-main">
            Comment
          </span>

          <textarea
            id={commentInputId}
            value={comment}
            onChange={(event) =>
              onMetafieldChange(id, "comment", event.target.value)
            }
            maxLength={MAX_IMAGE_COMMENT_LENGTH}
            disabled={disabled}
            placeholder="Type here..."
            className="h-[114px] w-full resize-none rounded-2xl border border-border-default px-[18px] py-4 text-sm font-normal leading-normal text-text-main outline-none placeholder:text-text-muted focus:border-brand disabled:cursor-not-allowed disabled:bg-border-light disabled:text-text-secondary min-[1360px]:h-[104px] min-[1536px]:h-[114px]"
          />
        </label>
      </div>
    </div>
  );
}
