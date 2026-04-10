export type ReceiptConfirmInput = {
  token: string;
  checklistConfirmed: boolean;
  signedByAgreement: boolean;
};

function text(value: string) {
  return value.trim();
}

export function normalizeReceiptConfirmInput(input: ReceiptConfirmInput) {
  const token = text(input.token);

  if (!token) {
    throw new Error("确认链接无效");
  }

  if (!input.checklistConfirmed) {
    throw new Error("请先勾选确认项");
  }

  if (!input.signedByAgreement) {
    throw new Error("请勾选确认声明后再提交");
  }

  return {
    token,
    confirmationMethod: "勾选确认",
    confirmedAt: new Date(),
  };
}
