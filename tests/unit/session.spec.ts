import { describe, expect, it } from "vitest";
import {
  createSessionValue,
  readSessionValue,
  SESSION_MAX_AGE_SECONDS,
  SESSION_SHORT_MAX_AGE_SECONDS,
} from "@/lib/session";

describe("session helpers", () => {
  it("应能为登录用户生成并解析会话值", () => {
    const secret = "dev-secret";
    const value = createSessionValue(
      {
        username: "admin",
        role: "系统管理员",
      },
      secret,
    );

    const parsed = readSessionValue(value, secret);
    expect(parsed).toMatchObject({
      username: "admin",
      role: "系统管理员",
    });
  });

  it("签名不合法时应返回空值", () => {
    const secret = "dev-secret";
    const value = createSessionValue(
      {
        username: "admin",
        role: "系统管理员",
      },
      secret,
    );

    expect(readSessionValue(`${value}-tampered`, secret)).toBeNull();
  });

  it("登录会话应使用长效过期时间", () => {
    expect(SESSION_MAX_AGE_SECONDS).toBe(60 * 60 * 24 * 365);
    expect(SESSION_SHORT_MAX_AGE_SECONDS).toBe(60 * 60 * 8);
  });
});
