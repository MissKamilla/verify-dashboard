export function getInitials(firstname?: string, lastname?: string) {
  const firstInitial = firstname?.trim().charAt(0) ?? "";
  const lastInitial = lastname?.trim().charAt(0) ?? "";

  return `${firstInitial}${lastInitial}`.toUpperCase() || "U";
}
