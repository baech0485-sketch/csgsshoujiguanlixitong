import { cookies } from "next/headers";
import { readCookieSession, SESSION_COOKIE_NAME } from "@/lib/session";

export async function getCurrentSession() {
  const cookieStore = await cookies();
  return readCookieSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}
