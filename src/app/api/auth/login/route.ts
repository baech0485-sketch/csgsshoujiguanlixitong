import { NextResponse } from "next/server";
import { validateAdminCredentials } from "@/lib/auth-user";
import { createSessionValue, getSessionSecret, SESSION_COOKIE_NAME } from "@/lib/session";

export async function POST(request: Request) {
  const payload = (await request.json()) as { username?: string; password?: string };
  const username = payload.username?.trim() || "";
  const password = payload.password?.trim() || "";

  if (!username || !password) {
    return NextResponse.json({ message: "账号和密码不能为空" }, { status: 400 });
  }

  const identity = await validateAdminCredentials(username, password);
  if (!identity) {
    return NextResponse.json({ message: "账号或密码错误" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, createSessionValue(identity, getSessionSecret()), {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
