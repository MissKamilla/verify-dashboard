import { useState } from "react";

import { RevokeGalleryAccessModal } from "./RevokeGalleryAccessModal";
import {
  useDeleteGalleryAccessMutation,
  useUpdateGalleryAccessMutation,
} from "@/features/gallery/galleryQueries";
import type {
  GalleryAccessListItem,
  GalleryAccessRole,
} from "@/features/gallery/types";

import actionDeleteIconUrl from "@/assets/icons/action-delete.svg";
import chevronDownIconUrl from "@/assets/icons/chevron-down.svg";
import dotsVerticalIconUrl from "@/assets/icons/dots-vertical.svg";

import { DropdownMenu, DropdownMenuItem } from "@/shared/ui/Dropdown";
import { Icon } from "@/shared/ui/Icon";
import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";

type GalleryAccessRowProps = {
  access: GalleryAccessListItem;
};

const roleOptions: Array<{
  value: GalleryAccessRole;
  label: string;
}> = [
  {
    value: "editor",
    label: "Editor",
  },
  {
    value: "viewer",
    label: "Viewer",
  },
];

export function GalleryAccessRow({ access }: GalleryAccessRowProps) {
  if (access.status === "pending") {
    return <PendingGalleryAccessRow access={access} />;
  }

  return <ActiveGalleryAccessRow access={access} />;
}

function ActiveGalleryAccessRow({
  access,
}: {
  access: Extract<GalleryAccessListItem, { status: "active" }>;
}) {
  const [apiError, setApiError] = useState("");
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [revokeError, setRevokeError] = useState("");

  const updateAccessMutation = useUpdateGalleryAccessMutation();
  const deleteAccessMutation = useDeleteGalleryAccessMutation();

  const isMutationPending =
    updateAccessMutation.isPending || deleteAccessMutation.isPending;

  const fullName = `${access.user.firstname} ${access.user.lastname}`.trim();

  const handleRoleChange = async (role: GalleryAccessRole) => {
    if (role === access.role) {
      return;
    }

    setApiError("");

    try {
      await updateAccessMutation.mutateAsync({
        galleryId: access.galleryId,
        userId: access.userId,
        payload: {
          role,
        },
      });
    } catch (error) {
      setApiError(getApiErrorMessage(error));
    }
  };

  const handleRevoke = async () => {
    setRevokeError("");

    try {
      await deleteAccessMutation.mutateAsync({
        galleryId: access.galleryId,
        userId: access.userId,
      });

      setIsRevokeModalOpen(false);
    } catch (error) {
      setRevokeError(getApiErrorMessage(error));
    }
  };

  const currentRoleLabel =
    roleOptions.find((option) => option.value === access.role)?.label ??
    access.role;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_40px] gap-x-3 gap-y-4 border-b border-border-default py-5 last:border-b-0 md:grid-cols-[1fr_1.4fr_140px_48px] md:items-center md:gap-4 md:px-4 md:py-4">
      <div className="col-span-2 md:col-span-1">
        <p className="text-lg font-medium leading-normal text-text-main md:text-sm md:font-normal">
          {fullName}
        </p>

        <p className="mt-1 break-all text-base leading-normal text-text-secondary md:hidden">
          {access.user.email}
        </p>
      </div>

      <div className="hidden md:block">
        <p className="break-all text-sm text-text-main">{access.user.email}</p>
      </div>

      <div className="col-start-1 md:col-auto">
        <span className="mb-2 block text-xs font-bold text-text-secondary md:hidden">
          Role
        </span>

        <DropdownMenu
          rootClassName="relative w-[180px] max-w-full md:w-auto"
          menuClassName="z-[60] w-[132px] rounded-2xl"
          renderInPortal
          portalAlign="end"
          trigger={({ isOpen, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              disabled={isMutationPending}
              className="flex h-10 w-[180px] max-w-full cursor-pointer items-center justify-between gap-2 rounded-2xl border border-border-light bg-white px-3 text-base font-medium text-text-main transition-colors hover:border-brand disabled:cursor-not-allowed disabled:opacity-60 md:h-9 md:w-[116px] md:text-sm"
              aria-label={`Change role for ${access.user.email}`}
              aria-expanded={isOpen}
              aria-haspopup="menu"
            >
              <span>{currentRoleLabel}</span>

              <Icon
                src={chevronDownIconUrl}
                className={`h-3 w-3 text-text-secondary transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          )}
        >
          {({ close }) => (
            <>
              {roleOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  isSelected={option.value === access.role}
                  onClick={() => {
                    close();
                    void handleRoleChange(option.value);
                  }}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenu>
      </div>

      <div className="col-start-2 flex items-end justify-center md:col-auto md:items-center">
        <DropdownMenu
          rootClassName="relative inline-block"
          menuClassName="z-[60] w-[132px] rounded-2xl"
          renderInPortal
          portalAlign="end"
          trigger={({ isOpen, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              disabled={isMutationPending}
              className="flex h-6 w-6 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={`Open actions for ${access.user.email}`}
              aria-expanded={isOpen}
              aria-haspopup="menu"
            >
              <img
                src={dotsVerticalIconUrl}
                alt=""
                className="h-6 w-6"
                aria-hidden="true"
              />
            </button>
          )}
        >
          {({ close }) => (
            <DropdownMenuItem
              iconSrc={actionDeleteIconUrl}
              className="text-error"
              onClick={() => {
                close();
                setRevokeError("");
                setIsRevokeModalOpen(true);
              }}
            >
              Revoke
            </DropdownMenuItem>
          )}
        </DropdownMenu>
      </div>

      {apiError && (
        <p
          role="alert"
          aria-live="polite"
          className="text-sm text-error md:col-span-4"
        >
          {apiError}
        </p>
      )}

      <RevokeGalleryAccessModal
        isOpen={isRevokeModalOpen}
        userEmail={access.user.email}
        isRevoking={deleteAccessMutation.isPending}
        error={revokeError}
        onConfirm={() => void handleRevoke()}
        onClose={() => {
          if (!deleteAccessMutation.isPending) {
            setIsRevokeModalOpen(false);
          }
        }}
      />
    </div>
  );
}

function PendingGalleryAccessRow({
  access,
}: {
  access: Extract<GalleryAccessListItem, { status: "pending" }>;
}) {
  const currentRoleLabel =
    roleOptions.find((option) => option.value === access.role)?.label ??
    access.role;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_40px] gap-x-3 gap-y-4 border-b border-border-default py-5 opacity-60 last:border-b-0 md:grid-cols-[1fr_1.4fr_140px_48px] md:items-center md:gap-4 md:px-4 md:py-4">
      <div className="col-span-2 md:col-span-1">
        <span
          title="Awaiting registration"
          className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-text-secondary text-xs text-text-secondary"
        >
          i
        </span>

        <p className="mt-1 break-all text-base text-text-secondary md:hidden">
          {access.email}
        </p>
      </div>

      <div className="hidden md:block">
        <p className="break-all text-sm text-text-secondary">{access.email}</p>
      </div>

      <div className="col-start-1 md:col-auto">
        <span className="mb-2 block text-xs font-bold text-text-secondary md:hidden">
          Role
        </span>

        <span className="text-sm text-text-secondary">{currentRoleLabel}</span>
      </div>

      <div />
    </div>
  );
}
