import { describe, expect, it } from "vitest";
import { normalizeReceiptConfirmInput } from "@/lib/receipt-confirm-input";

describe("normalizeReceiptConfirmInput", () => {
  it("应规范领取确认输入", () => {
    const result = normalizeReceiptConfirmInput({
      token: "token-001",
      checklistConfirmed: true,
      signedByAgreement: true,
    });

    expect(result.token).toBe("token-001");
    expect(result.confirmationMethod).toBe("勾选确认");
    expect(result.confirmedAt).toBeInstanceOf(Date);
  });

  it("缺少 token 时应抛出错误", () => {
    expect(() =>
      normalizeReceiptConfirmInput({
        token: "",
        checklistConfirmed: true,
        signedByAgreement: true,
      }),
    ).toThrow("确认链接无效");
  });

  it("未勾选确认项或未勾选最终声明时应抛出错误", () => {
    expect(() =>
      normalizeReceiptConfirmInput({
        token: "token-001",
        checklistConfirmed: false,
        signedByAgreement: true,
      }),
    ).toThrow("请先勾选确认项");

    expect(() =>
      normalizeReceiptConfirmInput({
        token: "token-001",
        checklistConfirmed: true,
        signedByAgreement: false,
      }),
    ).toThrow("请勾选确认声明后再提交");
  });
});
