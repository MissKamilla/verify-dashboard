import { useState } from "react";

import { Outlet, useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Sidebar } from "@/components/Sidebar";

import { removeAuthToken } from "@/features/auth/authToken";
import { useRedirectOnUnauthorized } from "@/features/auth/useRedirectOnUnauthorized";
import { getProfile } from "@/features/profile/profileApi";

import closeIconUrl from "@/assets/icons/close.svg";

export type AuthenticatedLayoutContext = {
  openMobileSidebar: () => void;
};

export function AuthenticatedLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: profile,
    error,
    isError,
    isPending,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    retry: false,
  });

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
      <div className="min-h-screen bg-[#FCFCFC] px-[16px] pt-[30px] pb-0 lg:p-[30px]">
        <div className="flex min-h-[calc(100vh-60px)] gap-[30px]">
          <Sidebar
            {...sidebarProps}
            className="hidden h-[calc(100vh-60px)] lg:flex"
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
              className="fixed bottom-[16px] left-[16px] top-[16px] z-50 w-[290px]"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="absolute right-[20px] top-[20px] z-10 flex h-[16px] w-[16px] cursor-pointer items-center justify-center"
                aria-label="Close menu"
              >
                <img src={closeIconUrl} alt="" className="h-[16px] w-[16px]" />
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
