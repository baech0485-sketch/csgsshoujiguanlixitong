export const DEFAULT_ADMIN_USERNAME = "csgs_admin";
export const DEFAULT_ADMIN_PASSWORD = "CSGS@2026!Admin";

export function validateFrontendAdminPassword(password: string) {
  return password.trim() === DEFAULT_ADMIN_PASSWORD;
}
