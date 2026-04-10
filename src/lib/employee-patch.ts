import { DEFAULT_EMPLOYEE_TITLE, EMPLOYEE_DEPARTMENTS } from "@/lib/employee-input";

type EmployeePatchInput = Partial<{
  name: string;
  department: string;
  phone: string;
  title: string;
  status: string;
}>;

function text(value: string) {
  return value.trim();
}

function normalizeStatus(status: string) {
  const value = text(status);
  if (value !== "在职" && value !== "离职") {
    throw new Error("员工状态仅支持在职或离职");
  }

  return value;
}

function normalizeDepartment(value: string) {
  const department = text(value);
  if (!department) {
    throw new Error("部门不能为空");
  }
  if (!EMPLOYEE_DEPARTMENTS.includes(department as (typeof EMPLOYEE_DEPARTMENTS)[number])) {
    throw new Error("部门仅支持武汉销售部或宜昌销售部");
  }
  return department;
}

export function normalizeEmployeePatch(input: EmployeePatchInput) {
  const patch: Record<string, string | Date> = {};

  if (input.name !== undefined) {
    const name = text(input.name);
    if (!name) {
      throw new Error("姓名不能为空");
    }
    patch.name = name;
  }

  if (input.department !== undefined) {
    patch.department = normalizeDepartment(input.department);
  }

  if (input.phone !== undefined) {
    patch.phone = text(input.phone);
  }

  if (input.title !== undefined) {
    patch.title = text(input.title) || DEFAULT_EMPLOYEE_TITLE;
  }

  if (input.status !== undefined) {
    patch.status = normalizeStatus(input.status);
  }

  patch.updatedAt = new Date();
  return patch;
}
