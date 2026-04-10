import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth-user";

describe("auth-user password helpers", () => {
  it("应能生成并验证密码摘要", () => {
    const result = hashPassword("CSGS@2026!Admin", "salt-001");

    expect(result.salt).toBe("salt-001");
    expect(result.hash).toHaveLength(64);
    expect(verifyPassword("CSGS@2026!Admin", result.salt, result.hash)).toBe(true);
  });

  it("错误密码不应通过验证", () => {
    const result = hashPassword("CSGS@2026!Admin", "salt-002");

    expect(verifyPassword("wrong-password", result.salt, result.hash)).toBe(false);
  });
});
