export type IncidentConfirmInput = {
  token: string;
  checklistConfirmed: boolean;
  signedByAgreement: boolean;
};

function text(value: string) {
  return value.trim();
}

export function normalizeIncidentConfirmInput(input: IncidentConfirmInput) {
  const token = text(input.token);

  if (!token) {
    throw new Error("异常确认链接无效");
  }

  if (!input.checklistConfirmed) {
    throw new Error("请先勾选异常确认项");
  }

  if (!input.signedByAgreement) {
    throw new Error("请勾选异常确认声明后再提交");
  }

  return {
    token,
    confirmationMethod: "勾选确认",
    confirmedAt: new Date(),
  };
}
