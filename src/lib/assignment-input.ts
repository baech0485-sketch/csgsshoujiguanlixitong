export type AssignmentInput = {
  employeeCode: string;
  employeeName: string;
  department: string;
  deviceCode: string;
  deviceTitle: string;
};

function text(value: string) {
  return value.trim();
}

export function normalizeAssignmentInput(input: AssignmentInput) {
  const employeeCode = text(input.employeeCode);
  const employeeName = text(input.employeeName);
  const department = text(input.department);
  const deviceCode = text(input.deviceCode);

  if (!employeeCode || !employeeName || !department || !deviceCode) {
    throw new Error("员工编号、员工姓名、部门和手机编号为必填项");
  }

  const now = new Date();

  return {
    employeeCode,
    employeeName,
    department,
    deviceCode,
    deviceTitle: text(input.deviceTitle),
    status: "待领取",
    createdAt: now,
    updatedAt: now,
  };
}
