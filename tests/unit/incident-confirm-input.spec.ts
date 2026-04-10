import { describe, expect, it } from "vitest";
import { normalizeIncidentConfirmInput } from "@/lib/incident-confirm-input";

describe("normalizeIncidentConfirmInput", () => {
  it("应规范异常确认输入", () => {
    const result = normalizeIncidentConfirmInput({
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
      normalizeIncidentConfirmInput({
        token: "",
        checklistConfirmed: true,
        signedByAgreement: true,
      }),
    ).toThrow("异常确认链接无效");
  });

  it("缺少核对项或最终确认时应抛出错误", () => {
    expect(() =>
      normalizeIncidentConfirmInput({
        token: "token-001",
        checklistConfirmed: false,
        signedByAgreement: true,
      }),
    ).toThrow("请先勾选异常确认项");

    expect(() =>
      normalizeIncidentConfirmInput({
        token: "token-001",
        checklistConfirmed: true,
        signedByAgreement: false,
      }),
    ).toThrow("请勾选异常确认声明后再提交");
  });
});
