import { useQuery } from "@tanstack/react-query";

import { getProfile } from "@/features/profile/profileApi";
import { isUnauthorizedError } from "@/shared/api/isUnauthorizedError";

export function ProfilePage() {
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
    </section>
  );
}
