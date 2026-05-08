import { useState } from "react";

import { NavLink, useLocation } from "react-router";

import logoUrl from "@/assets/verify-logo-black.svg";
import galleryIconUrl from "@/assets/icons/gallery.svg";
import chevronDownIconUrl from "@/assets/icons/chevron-down.svg";
import logoutIconUrl from "@/assets/icons/logout.svg";

import { getInitials } from "@/features/profile/getInitials";

type SidebarProps = {
  firstname?: string;
  lastname?: string;
  email?: string;
  isProfilePending: boolean;
  onLogout: () => void;
  onNavigate?: () => void;
  className?: string;
};

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
    `h-[30px] pl-[54px] pt-[3px] text-[16px] leading-[150%] transition-colors active:text-[#161616] ${
      isActive
        ? "font-bold text-[#161616]"
        : "font-normal text-[#A0B1A5] hover:text-[#161616]"
    }`;

  return (
    <aside
      className={`flex w-[290px] shrink-0 flex-col rounded-[30px] bg-white shadow-[14px_17px_40px_4px_rgba(125,181,147,0.08)] ${className}`}
    >
      <div className="flex h-[136px] items-center justify-center">
        <img src={logoUrl} alt="Verify" className="max-w-[158px]" />
      </div>

      <div className="h-px w-full bg-[#EDEDED]" />

      <nav className="mt-[36px]">
        <div className="flex h-[24px] w-full items-center px-[20px]">
          <NavLink
            to="/galleries"
            onClick={onNavigate}
            className={() =>
              `flex items-center gap-[10px] text-[16px] font-bold leading-[150%] transition-colors ${
                isSectionActive("/galleries")
                  ? "text-[#161616]"
                  : "text-[#A0B1A5] hover:text-[#161616]"
              }`
            }
          >
            <img src={galleryIconUrl} alt="" className="h-[24px] w-[24px]" />
            <span>Gallery</span>
          </NavLink>

          <button
            type="button"
            onClick={() => toggleSection("galleries")}
            className="ml-auto flex h-[24px] w-[24px] cursor-pointer items-center justify-center"
            aria-label={
              isSectionOpen("galleries")
                ? "Collapse gallery menu"
                : "Expand gallery menu"
            }
            aria-expanded={isSectionOpen("galleries")}
          >
            <img
              src={chevronDownIconUrl}
              alt=""
              className={`h-[5px] w-[10px] transition-transform ${
                isSectionOpen("galleries") ? "rotate-0" : "-rotate-90"
              }`}
            />
          </button>
        </div>

        {isSectionOpen("galleries") && (
          <div className="mt-[18px] flex flex-col gap-[24px]">
            <NavLink
              to="/galleries/list"
              onClick={onNavigate}
              className={getSubmenuLinkClassName}
            >
              List of galleries
            </NavLink>

            <NavLink
              to="/galleries/search"
              onClick={onNavigate}
              className={getSubmenuLinkClassName}
            >
              Search among galleries
            </NavLink>
          </div>
        )}
      </nav>

      <div className="mt-auto px-[10px] pb-[28px]">
        <NavLink
          to="/profile"
          onClick={onNavigate}
          className={({ isActive }) =>
            `mb-[24px] flex h-[68px] w-[270px] cursor-pointer items-center gap-[10px] rounded-[16px] p-[10px] transition-colors ${
              isActive ? "bg-[#ECFFEE]" : "hover:bg-[#ECFFEE]"
            }`
          }
        >
          <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-[#1FB28B] text-[16px] font-bold leading-[150%] text-white">
            {isProfilePending ? "" : userInitials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-[16px] font-bold leading-[150%] text-[#161616]">
              {userName}
            </p>

            <p className="truncate text-[12px] font-normal leading-[150%] text-[#878787]">
              {userEmail}
            </p>
          </div>
        </NavLink>

        <button
          type="button"
          onClick={onLogout}
          className="flex h-[30px] cursor-pointer items-center gap-[10px] px-[20px] text-[16px] font-normal leading-[150%] text-[#A0B1A5] transition-colors hover:text-[#161616]"
        >
          <img src={logoutIconUrl} alt="" className="h-[24px] w-[24px]" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
