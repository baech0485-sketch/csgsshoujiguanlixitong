export type ApprovalInput = {
  type: string;
  requester: string;
  department: string;
  title: string;
  description: string;
};

export type IncidentInput = {
  type: string;
  assetCode: string;
  description: string;
};

export type OffboardingInput = {
  employeeName: string;
  department: string;
  leavingDate: string;
};

function text(value: string) {
  return value.trim();
}

export function normalizeApprovalInput(input: ApprovalInput) {
  const type = text(input.type);
  const requester = text(input.requester);
  const department = text(input.department);
  const title = text(input.title);

  if (!type || !requester || !department || !title) {
    throw new Error("审批类型、申请人、部门和标题为必填项");
  }

  const now = new Date();

  return {
    type,
    requester,
    department,
    title,
    description: text(input.description),
    status: "待审批",
    createdAt: now,
    updatedAt: now,
  };
}

export function normalizeIncidentInput(input: IncidentInput) {
  const type = text(input.type);
  const assetCode = text(input.assetCode);

  if (!type || !assetCode) {
    throw new Error("异常类型和手机编号为必填项");
  }

  const now = new Date();
  return {
    type,
    assetCode,
    description: text(input.description),
    status: type === "送修申请" ? "待送修" : type === "损坏" ? "维修中" : "丢失待备案",
    createdAt: now,
    updatedAt: now,
  };
}

export function normalizeOffboardingInput(input: OffboardingInput) {
  const employeeName = text(input.employeeName);
  const department = text(input.department);
  const leavingDate = text(input.leavingDate);

  if (!employeeName || !department || !leavingDate) {
    throw new Error("姓名、部门和离职日期为必填项");
  }

  const now = new Date();
  return {
    employeeName,
    department,
    leavingDate,
    status: "资产待回收",
    createdAt: now,
    updatedAt: now,
  };
}
