import { NextResponse, type NextRequest } from "next/server";
import { readSessionValueEdge } from "@/lib/session-edge";

const SESSION_COOKIE_NAME = "cs_session";
const publicRoutes = new Set(["/login", "/m/receipt-success", "/m/return-success", "/m/incident-success", "/m/device-entry", "/m/device-entry-success"]);

function isPublicRoute(pathname: string) {
  if (publicRoutes.has(pathname)) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/api/auth/login")) return true;
  if (pathname.startsWith("/api/auth/logout")) return true;
  if (pathname.startsWith("/api/workflows/receipt-confirm")) return true;
  if (pathname.startsWith("/api/workflows/return-confirm")) return true;
  if (pathname.startsWith("/api/workflows/incident-confirm")) return true;
  if (pathname.startsWith("/api/public/device-entry")) return true;
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    (pathname.startsWith("/m/receipt-confirm") || pathname.startsWith("/m/return-confirm") || pathname.startsWith("/m/incident-confirm")) &&
    request.nextUrl.searchParams.get("token")
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionCookie ? await readSessionValueEdge(sessionCookie) : null;

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!session && !isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
};
