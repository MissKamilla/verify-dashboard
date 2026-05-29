import closeIconUrl from "@/assets/icons/close.svg";

import { Icon } from "@/shared/ui/Icon";

import { MAX_IMAGE_COMMENT_LENGTH, MAX_IMAGE_NAME_LENGTH } from "../constants";

type ImageMetafieldsCardProps = {
  id: string;
  imageSrc: string;
  imageAlt: string;
  name: string;
  comment: string;
  disabled?: boolean;
  readOnly?: boolean;
  onMetafieldChange?: (
    imageId: string,
    field: "name" | "comment",
    value: string,
  ) => void;
  onRemoveClick?: () => void;
};

export function ImageMetafieldsCard({
  id,
  imageSrc,
  imageAlt,
  name,
  comment,
  disabled = false,
  readOnly = false,
  onMetafieldChange,
  onRemoveClick,
}: ImageMetafieldsCardProps) {
  const nameInputId = `image-name-${id}`;
  const commentInputId = `image-comment-${id}`;
  const canEdit = !readOnly && !!onMetafieldChange;

  return (
    <div className="grid w-full max-w-[330px] gap-4 min-[900px]:max-w-none min-[1360px]:max-w-[680px] min-[1360px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] min-[1360px]:gap-5 2xl:max-w-[820px] 2xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="relative w-full">
        <div className="overflow-hidden rounded-2xl">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="aspect-square w-full object-cover"
          />
        </div>

        {onRemoveClick && (
          <button
            type="button"
            onClick={onRemoveClick}
            disabled={disabled}
            className="absolute -right-2 -top-2 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-page-bg disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Remove photo"
          >
            <Icon src={closeIconUrl} className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="flex min-w-0 w-full flex-col gap-4 min-[1360px]:h-full">
        <label className="flex flex-col gap-2" htmlFor={nameInputId}>
          <span className="text-sm font-medium leading-none text-text-main">
            Name
          </span>

          <input
            id={nameInputId}
            type="text"
            value={name}
            onChange={(event) =>
              onMetafieldChange?.(id, "name", event.target.value)
            }
            maxLength={MAX_IMAGE_NAME_LENGTH}
            disabled={disabled}
            readOnly={!canEdit}
            placeholder="Name"
            className="h-[50px] w-full rounded-2xl border border-border-default px-[18px] text-sm font-normal text-text-main outline-none placeholder:text-text-muted focus:border-brand disabled:cursor-not-allowed disabled:bg-border-light disabled:text-text-secondary"
          />
        </label>

        <label
          className="flex flex-col gap-2 min-[1360px]:min-h-0 min-[1360px]:flex-1"
          htmlFor={commentInputId}
        >
          <span className="text-sm font-medium leading-none text-text-main">
            Comment
          </span>

          <textarea
            id={commentInputId}
            value={comment}
            onChange={(event) =>
              onMetafieldChange?.(id, "comment", event.target.value)
            }
            maxLength={MAX_IMAGE_COMMENT_LENGTH}
            disabled={disabled}
            readOnly={!canEdit}
            placeholder="Type here..."
            className="h-[100px] w-full resize-none rounded-2xl border border-border-default px-[18px] py-4 text-sm font-normal leading-normal text-text-main outline-none placeholder:text-text-muted focus:border-brand disabled:cursor-not-allowed disabled:bg-border-light disabled:text-text-secondary min-[1360px]:min-h-0 min-[1360px]:flex-1"
          />
        </label>
      </div>
    </div>
  );
}
