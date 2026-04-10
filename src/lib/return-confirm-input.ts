export type ReturnConfirmInput = {
  token: string;
  signedByAgreement: boolean;
};

function text(value: string) {
  return value.trim();
}

export function normalizeReturnConfirmInput(input: ReturnConfirmInput) {
  const token = text(input.token);

  if (!token) {
    throw new Error("归还链接无效");
  }

  if (!input.signedByAgreement) {
    throw new Error("请勾选归还确认声明后再提交");
  }

  return {
    token,
    confirmationMethod: "勾选确认",
    confirmedAt: new Date(),
  };
}
