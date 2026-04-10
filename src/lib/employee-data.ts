import { buildNextEmployeeCode } from "@/lib/employee-input";
import { getDevicesCollection, getEmployeesCollection } from "@/lib/mongodb";

export type EmployeeViewRow = {
  employeeCode: string;
  name: string;
  department: string;
  phone: string;
  title: string;
  status: string;
  deviceCount: number;
  repairingCount: number;
};

export type EmployeeSummary = {
  total: number;
  active: number;
  inactive: number;
};

export async function getEmployeesView(search = "", status = "在职"): Promise<EmployeeViewRow[]> {
  const employees = await getEmployeesCollection();
  const devices = await getDevicesCollection();
  const keyword = search.trim();
  const query: Record<string, unknown> = {};

  if (status === "在职" || status === "离职") {
    query.status = status;
  }

  if (keyword) {
    query.$or = [
      { employeeCode: { $regex: keyword, $options: "i" } },
      { name: { $regex: keyword, $options: "i" } },
    ];
  }

  const rows = await employees.find(query).sort({ updatedAt: -1 }).limit(200).toArray();

  return Promise.all(
    rows.map(async (row) => {
      const employeeCode = String(row.employeeCode ?? "");
      const [deviceCount, repairingCount] = await Promise.all([
        devices.countDocuments({
          currentOwnerCode: employeeCode,
          status: "已分配",
        }),
        devices.countDocuments({
          currentOwnerCode: employeeCode,
          status: "修理中",
        }),
      ]);

      return {
        employeeCode,
        name: String(row.name ?? ""),
        department: String(row.department ?? ""),
        phone: String(row.phone ?? ""),
        title: String(row.title ?? ""),
        status: String(row.status ?? "在职"),
        deviceCount,
        repairingCount,
      };
    }),
  );
}

export async function getEmployeesViewByDepartment(search = "", status = "在职", department = ""): Promise<EmployeeViewRow[]> {
  const employees = await getEmployeesCollection();
  const devices = await getDevicesCollection();
  const keyword = search.trim();
  const query: Record<string, unknown> = {};

  if (status === "在职" || status === "离职") {
    query.status = status;
  }

  if (department === "武汉销售部" || department === "宜昌销售部") {
    query.department = department;
  }

  if (keyword) {
    query.$or = [
      { employeeCode: { $regex: keyword, $options: "i" } },
      { name: { $regex: keyword, $options: "i" } },
    ];
  }

  const rows = await employees.find(query).sort({ updatedAt: -1 }).limit(200).toArray();

  return Promise.all(
    rows.map(async (row) => {
      const employeeCode = String(row.employeeCode ?? "");
      const [deviceCount, repairingCount] = await Promise.all([
        devices.countDocuments({
          currentOwnerCode: employeeCode,
          status: "已分配",
        }),
        devices.countDocuments({
          currentOwnerCode: employeeCode,
          status: "修理中",
        }),
      ]);

      return {
        employeeCode,
        name: String(row.name ?? ""),
        department: String(row.department ?? ""),
        phone: String(row.phone ?? ""),
        title: String(row.title ?? ""),
        status: String(row.status ?? "在职"),
        deviceCount,
        repairingCount,
      };
    }),
  );
}

export async function getNextEmployeeCode() {
  const employees = await getEmployeesCollection();
  const rows = await employees.find({}, { projection: { employeeCode: 1 } }).toArray();
  return buildNextEmployeeCode(rows.map((item) => String(item.employeeCode ?? "")));
}

export async function getEmployeeSummary(): Promise<EmployeeSummary> {
  const employees = await getEmployeesCollection();
  const [total, active, inactive] = await Promise.all([
    employees.countDocuments({}),
    employees.countDocuments({ status: "在职" }),
    employees.countDocuments({ status: "离职" }),
  ]);

  return {
    total,
    active,
    inactive,
  };
}
