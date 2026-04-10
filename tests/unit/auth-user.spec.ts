import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth-user";
import { DEFAULT_ADMIN_PASSWORD, validateFrontendAdminPassword } from "@/lib/admin-account";

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

  it("固定前端密码应能通过校验", () => {
    expect(DEFAULT_ADMIN_PASSWORD).toBe("CSGS@2026!Admin");
    expect(validateFrontendAdminPassword("CSGS@2026!Admin")).toBe(true);
  });

  it("非固定前端密码不应通过校验", () => {
    expect(validateFrontendAdminPassword("wrong-password")).toBe(false);
  });
});
