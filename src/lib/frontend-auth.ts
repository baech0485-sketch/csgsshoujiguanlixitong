import { DEFAULT_ADMIN_USERNAME } from "@/lib/admin-account";

export const FRONTEND_AUTH_STORAGE_KEY = "csgs_frontend_auth_token";

export type FrontendAuthSession = {
  token: string;
  username: string;
  role: string;
  issuedAt: number;
};

type AuthStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function createFrontendAuthSession(now = Date.now()): FrontendAuthSession {
  return {
    token: `${DEFAULT_ADMIN_USERNAME}:${now}`,
    username: DEFAULT_ADMIN_USERNAME,
    role: "系统管理员",
    issuedAt: now,
  };
}

export function isValidFrontendAuthSession(value: unknown): value is FrontendAuthSession {
  if (!value || typeof value !== "object") return false;

  const session = value as Partial<FrontendAuthSession>;
  return (
    typeof session.token === "string" &&
    session.token.length > 0 &&
    typeof session.username === "string" &&
    session.username.length > 0 &&
    typeof session.role === "string" &&
    session.role.length > 0 &&
    typeof session.issuedAt === "number"
  );
}

export function readFrontendAuthSession(storage?: AuthStorage | null) {
  if (!storage) return null;

  try {
    const rawValue = storage.getItem(FRONTEND_AUTH_STORAGE_KEY);
    if (!rawValue) return null;
    const parsed = JSON.parse(rawValue) as unknown;

    if (!isValidFrontendAuthSession(parsed)) {
      storage.removeItem(FRONTEND_AUTH_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    storage.removeItem(FRONTEND_AUTH_STORAGE_KEY);
    return null;
  }
}

export function persistFrontendAuthSession(storage: AuthStorage, session: FrontendAuthSession) {
  storage.setItem(FRONTEND_AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearFrontendAuthSession(storage: AuthStorage) {
  storage.removeItem(FRONTEND_AUTH_STORAGE_KEY);
}

export function getBrowserFrontendAuthSession() {
  if (typeof window === "undefined") return null;
  return readFrontendAuthSession(window.localStorage);
}

export function persistBrowserFrontendAuthSession(session: FrontendAuthSession) {
  if (typeof window === "undefined") return;
  persistFrontendAuthSession(window.localStorage, session);
}

export function clearBrowserFrontendAuthSession() {
  if (typeof window === "undefined") return;
  clearFrontendAuthSession(window.localStorage);
}

const publicRoutes = new Set([
  "/login",
  "/m/receipt-success",
  "/m/return-success",
  "/m/incident-success",
  "/m/device-entry",
  "/m/device-entry-success",
]);

export function isPublicFrontendPath(pathname: string, search: string) {
  if (publicRoutes.has(pathname)) return true;

  const searchParams = new URLSearchParams(search);
  if (
    (pathname.startsWith("/m/receipt-confirm") ||
      pathname.startsWith("/m/return-confirm") ||
      pathname.startsWith("/m/incident-confirm")) &&
    searchParams.get("token")
  ) {
    return true;
  }

  return false;
}
