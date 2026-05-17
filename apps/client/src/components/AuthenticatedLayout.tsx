import { useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

import closeIconUrl from "@/assets/icons/close.svg";

import { Sidebar } from "@/components/Sidebar";

import { removeAuthToken } from "@/features/auth/authToken";
import { useRedirectOnUnauthorized } from "@/features/auth/useRedirectOnUnauthorized";
import { useProfileQuery } from "@/features/profile/profileQueries";

import { Icon } from "@/shared/ui/Icon";

export type AuthenticatedLayoutContext = {
  openMobileSidebar: () => void;
};

export function AuthenticatedLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile, error, isError, isPending } = useProfileQuery();

  useRedirectOnUnauthorized({ isError, error });

  const handleLogout = () => {
    removeAuthToken();
    queryClient.clear();
    navigate("/login", { replace: true });
  };

  const sidebarProps = {
    firstname: profile?.firstname,
    lastname: profile?.lastname,
    email: profile?.email,
    isProfilePending: isPending,
    onLogout: handleLogout,
  };

  return (
    <>
      <div className="min-h-screen bg-page-bg px-4 pt-[30px] pb-0 lg:p-[30px]">
        <div className="flex min-h-[calc(100vh-60px)] gap-[30px]">
          <Sidebar
            {...sidebarProps}
            className="hidden h-[calc(100vh-60px)] self-start lg:sticky lg:top-[30px] lg:flex"
          />
          <main className="min-w-0 flex-1">
            <Outlet
              context={{
                openMobileSidebar: () => setIsMobileSidebarOpen(true),
              }}
            />
          </main>
        </div>

        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/70 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <div
              className="fixed bottom-4 left-4 top-4 z-50 w-[290px]"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="absolute right-5 top-5 z-10 flex h-4 w-4 cursor-pointer items-center justify-center"
                aria-label="Close menu"
              >
                <Icon src={closeIconUrl} className="h-4 w-4" />
              </button>

              <Sidebar
                {...sidebarProps}
                onNavigate={() => setIsMobileSidebarOpen(false)}
                className="h-full overflow-y-auto"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
