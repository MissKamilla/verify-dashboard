import { hasAuthToken, removeAuthToken } from "@/features/auth/authToken";
import { NavLink, useNavigate } from "react-router";

export function AppNavigation() {
  const navigate = useNavigate();
  const isAuthenticated = hasAuthToken();

  const handleLogout = () => {
    removeAuthToken();
    navigate("/login", { replace: true });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="mb-6 flex gap-4">
      <NavLink to="/galleries">Galleries</NavLink>
      <NavLink to="/profile">Profile settings</NavLink>
      <button onClick={handleLogout}>Log out</button>
    </nav>
  );
}
