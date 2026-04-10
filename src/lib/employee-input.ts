export type EmployeeStatus = "在职" | "离职";
export const EMPLOYEE_DEPARTMENTS = ["武汉销售部", "宜昌销售部"] as const;
export const DEFAULT_EMPLOYEE_TITLE = "销售";

export type EmployeeInput = {
  employeeCode: string;
  name: string;
  department: string;
  phone: string;
  title: string;
  status: string;
};

function text(value: string) {
  return value.trim();
}

function normalizeEmployeeCode(value: string) {
  const employeeCode = text(value).toLowerCase();
  if (!/^cs-\d{2,}$/.test(employeeCode)) {
    throw new Error("员工编号格式必须为 cs-01");
  }
  return employeeCode;
}

function normalizeDepartment(value: string) {
  const department = text(value);
  if (!department) {
    throw new Error("员工编号、姓名和部门为必填项");
  }
  if (!EMPLOYEE_DEPARTMENTS.includes(department as (typeof EMPLOYEE_DEPARTMENTS)[number])) {
    throw new Error("部门仅支持武汉销售部或宜昌销售部");
  }
  return department;
}

function normalizeStatus(status: string): EmployeeStatus {
  const value = text(status);
  if (!value) {
    return "在职";
  }

  if (value !== "在职" && value !== "离职") {
    throw new Error("员工状态仅支持在职或离职");
  }

  return value;
}

export function buildNextEmployeeCode(existingCodes: string[]) {
  let max = 0;
  for (const rawCode of existingCodes) {
    const match = text(rawCode).toLowerCase().match(/^cs-(\d+)$/);
    if (!match) continue;
    max = Math.max(max, Number.parseInt(match[1], 10));
  }
  return `cs-${String(max + 1).padStart(2, "0")}`;
}

export function normalizeEmployeeInput(input: EmployeeInput) {
  const employeeCode = normalizeEmployeeCode(input.employeeCode);
  const name = text(input.name);
  const department = normalizeDepartment(input.department);

  if (!employeeCode || !name || !department) {
    throw new Error("员工编号、姓名和部门为必填项");
  }

  const now = new Date();

  return {
    employeeCode,
    name,
    department,
    phone: text(input.phone),
    title: text(input.title) || DEFAULT_EMPLOYEE_TITLE,
    status: normalizeStatus(input.status),
    deviceCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}
