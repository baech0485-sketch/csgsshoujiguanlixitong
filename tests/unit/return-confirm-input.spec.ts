import { describe, expect, it } from "vitest";
import { normalizeReturnConfirmInput } from "@/lib/return-confirm-input";

describe("normalizeReturnConfirmInput", () => {
  it("应规范离职归还确认输入", () => {
    const result = normalizeReturnConfirmInput({
      token: "token-001",
      signedByAgreement: true,
    });

    expect(result.token).toBe("token-001");
    expect(result.confirmationMethod).toBe("勾选确认");
    expect(result.confirmedAt).toBeInstanceOf(Date);
  });

  it("缺少 token 时应抛出错误", () => {
    expect(() =>
      normalizeReturnConfirmInput({
        token: "",
        signedByAgreement: true,
      }),
    ).toThrow("归还链接无效");
  });

  it("缺少最终确认勾选时应抛出错误", () => {
    expect(() =>
      normalizeReturnConfirmInput({
        token: "token-001",
        signedByAgreement: false,
      }),
    ).toThrow("请勾选归还确认声明后再提交");
  });
});
