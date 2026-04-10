import { NextResponse } from "next/server";
import { validateAdminPassword } from "@/lib/auth-user";

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

  return NextResponse.json({
    ok: true,
    rememberPassword,
    identity,
  });
}
