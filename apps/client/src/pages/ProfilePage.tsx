import { useQuery } from "@tanstack/react-query";

import { getProfile } from "@/features/profile/profileApi";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/shared/api/isUnauthorizedError";
import { removeAuthToken } from "@/features/auth/authToken";

export function ProfilePage() {
  const navigate = useNavigate();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    retry: false,
  });

  useEffect(() => {
    if (!profileQuery.isError) {
      return;
    }

    if (!isUnauthorizedError(profileQuery.error)) {
      return;
    }

    removeAuthToken();
    navigate("/login", { replace: true });
  }, [profileQuery.isError, profileQuery.error, navigate]);

  if (profileQuery.isPending) {
    return <p>Loading profile...</p>;
  }

  if (profileQuery.isError) {
    if (isUnauthorizedError(profileQuery.error)) {
      return <p>Redirecting to login...</p>;
    }

    return <p>Failed to load profile</p>;
  }

  const profile = profileQuery.data;

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
