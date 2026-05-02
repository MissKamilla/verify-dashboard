import { NavLink } from "react-router";

export function AppNavigation() {
  return (
    <nav className="mb-6 flex gap-4">
      <NavLink to="/login">Login</NavLink>
      <NavLink to="/register">Register</NavLink>
      <NavLink to="/galleries">Galleries</NavLink>
      <NavLink to="/profile">Profile</NavLink>
    </nav>
  );
}
