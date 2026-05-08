import { useQuery } from "@tanstack/react-query";
import burgerIconUrl from "@/assets/icons/burger.svg";
import { getProfile } from "@/features/profile/profileApi";
import { isUnauthorizedError } from "@/shared/api/isUnauthorizedError";
import type { AuthenticatedLayoutContext } from "@/components/AuthenticatedLayout";
import { useOutletContext } from "react-router";

export function ProfilePage() {
  const { openMobileSidebar } = useOutletContext<AuthenticatedLayoutContext>();
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

  if (isPending) {
    return <p>Loading profile...</p>;
  }

  if (isError) {
    if (isUnauthorizedError(error)) {
      return <p>Redirecting to login...</p>;
    }

    return <p>Failed to load profile</p>;
  }

  return (
    <section>
      <h1>Profile</h1>

      <h2>
        {profile.firstname} {profile.lastname}
      </h2>

      <p>{profile.email}</p>
      <p>{profile.createdAt}</p>

      <button
        type="button"
        onClick={openMobileSidebar}
        className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center"
        aria-label="Open menu"
      >
        <img src={burgerIconUrl} alt="" className="h-[24px] w-[24px]" />
      </button>
    </section>
  );
}
