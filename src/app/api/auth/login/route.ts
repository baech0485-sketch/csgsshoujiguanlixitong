import { NextResponse } from "next/server";
import { validateAdminPassword } from "@/lib/auth-user";
import {
  createSessionValue,
  getSessionSecret,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  SESSION_SHORT_MAX_AGE_SECONDS,
} from "@/lib/session";

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    password?: string;
    rememberPassword?: boolean;
  };
  const password = payload.password?.trim() || "";
  const rememberPassword = payload.rememberPassword !== false;

  if (!password) {
    return NextResponse.json({ message: "请输入登录密码" }, { status: 400 });
  }

  const identity = await validateAdminPassword(password);
  if (!identity) {
    return NextResponse.json({ message: "登录密码错误" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, createSessionValue(identity, getSessionSecret()), {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: rememberPassword ? SESSION_MAX_AGE_SECONDS : SESSION_SHORT_MAX_AGE_SECONDS,
  });

  return response;
}
