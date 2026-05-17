import { useState } from "react";
import { NavLink, useLocation } from "react-router";

import logoUrl from "@/assets/verify-logo-black.svg";
import galleryIconUrl from "@/assets/icons/gallery.svg";
import chevronDownIconUrl from "@/assets/icons/chevron-down.svg";
import logoutIconUrl from "@/assets/icons/logout.svg";

import { getInitials } from "@/features/profile/getInitials";

import { Icon } from "@/shared/ui/Icon";

type SidebarProps = {
  firstname?: string;
  lastname?: string;
  email?: string;
  isProfilePending: boolean;
  onLogout: () => void;
  onNavigate?: () => void;
  className?: string;
};

const activeTextClassName = "text-text-main";
const inactiveTextClassName = "text-text-muted hover:text-text-main";

const openedSectionIconClassName = "text-brand";
const closedSectionIconClassName = "text-text-muted";

export function Sidebar({
  firstname,
  lastname,
  email,
  isProfilePending,
  onLogout,
  onNavigate,
  className = "",
}: SidebarProps) {
  const [openSectionIds, setOpenSectionIds] = useState<string[]>(["galleries"]);

  const toggleSection = (sectionId: string) => {
    setOpenSectionIds((currentIds) =>
      currentIds.includes(sectionId)
        ? currentIds.filter((id) => id !== sectionId)
        : [...currentIds, sectionId],
    );
  };

  const isSectionOpen = (sectionId: string) => {
    return openSectionIds.includes(sectionId);
  };

  const location = useLocation();

  const isSectionActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const userInitials = getInitials(firstname, lastname);

  const userName =
    firstname && lastname ? `${firstname} ${lastname}` : "Loading profile";

  const userEmail = email ?? "";

  const getSubmenuLinkClassName = ({ isActive }: { isActive: boolean }) =>
    `h-[30px] pl-[54px] pt-[3px] text-[16px] leading-[150%] transition-colors${
      isActive
        ? `font-bold ${activeTextClassName}`
        : `font-normal ${inactiveTextClassName}`
    }`;

  const getSectionLinkClassName = (sectionPath: string) =>
    `flex items-center gap-[10px] text-[16px] font-bold leading-[150%] transition-colors ${
      isSectionActive(sectionPath) ? activeTextClassName : inactiveTextClassName
    }`;

  const getSectionIconClassName = (sectionPath: string) =>
    isSectionActive(sectionPath)
      ? openedSectionIconClassName
      : closedSectionIconClassName;

  const getSectionChevronClassName = (sectionId: string) =>
    isSectionOpen(sectionId)
      ? `rotate-0 ${openedSectionIconClassName}`
      : `-rotate-90 ${closedSectionIconClassName}`;

  return (
    <aside
      className={`flex w-[290px] shrink-0 flex-col rounded-[30px] bg-white shadow-card ${className}`}
    >
      <div className="flex h-[136px] items-center justify-center">
        <img src={logoUrl} alt="Verify" className="max-w-[158px]" />
      </div>

      <div className="h-px w-full bg-border-light" />

      <nav className="mt-[36px]">
        <div className="flex h-[24px] w-full items-center px-[20px]">
          <button
            type="button"
            onClick={() => toggleSection("galleries")}
            className="flex w-full cursor-pointer items-center"
            aria-label={
              isSectionOpen("galleries")
                ? "Collapse gallery menu"
                : "Expand gallery menu"
            }
            aria-expanded={isSectionOpen("galleries")}
          >
            <NavLink
              to="/galleries"
              onClick={onNavigate}
              className={() => getSectionLinkClassName("/galleries")}
            >
              <Icon
                src={galleryIconUrl}
                className={`h-[24px] w-[24px] ${getSectionIconClassName("/galleries")}`}
              />
              Gallery
            </NavLink>
            <Icon
              src={chevronDownIconUrl}
              className={`ml-auto h-[5px] w-[10px] transition-transform ${getSectionChevronClassName(
                "galleries",
              )}`}
            />
          </button>
        </div>

        {isSectionOpen("galleries") && (
          <div className="mt-[18px] flex flex-col gap-[24px]">
            <NavLink
              to="/galleries"
              end
              onClick={onNavigate}
              className={getSubmenuLinkClassName}
            >
              List of galleries
            </NavLink>
            <span
              className="h-[30px] cursor-not-allowed pl-[54px] pt-[3px] text-[16px] font-normal leading-[150%] text-text-muted opacity-50"
              aria-disabled="true"
            >
              Search among galleries
            </span>
          </div>
        )}
      </nav>

      <div className="mt-auto px-[10px] pb-[28px]">
        <NavLink
          to="/profile"
          onClick={onNavigate}
          className={({ isActive }) =>
            `mb-[24px] flex h-[68px] w-[270px] cursor-pointer items-center gap-[10px] rounded-[16px] p-[10px] transition-colors ${
              isActive ? "bg-brand-light" : "hover:bg-brand-light"
            }`
          }
        >
          <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-avatar text-[16px] font-bold leading-[150%] text-white">
            {isProfilePending ? "" : userInitials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-[16px] font-bold leading-[150%] text-text-main">
              {userName}
            </p>

            <p className="truncate text-[12px] font-normal leading-[150%] text-text-secondary">
              {userEmail}
            </p>
          </div>
        </NavLink>

        <button
          type="button"
          onClick={onLogout}
          className="flex h-[30px] cursor-pointer items-center gap-[10px] px-[20px] text-[16px] font-normal leading-[150%] text-text-muted transition-colors hover:text-error"
        >
          <Icon src={logoutIconUrl} className="h-[24px] w-[24px]" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
