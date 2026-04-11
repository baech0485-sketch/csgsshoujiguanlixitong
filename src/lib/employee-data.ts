import { buildNextEmployeeCode } from "@/lib/employee-input";
import { buildOwnerDeviceMetrics } from "@/lib/device-ownership";
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
  const employeeCodes = rows.map((row) => String(row.employeeCode ?? "")).filter(Boolean);
  const deviceRows = employeeCodes.length
    ? await devices
        .find(
          {
            currentOwnerCode: { $in: employeeCodes },
            status: { $in: ["已分配", "修理中"] },
          },
          {
            projection: {
              assetCode: 1,
              brand: 1,
              model: 1,
              storage: 1,
              currentOwnerCode: 1,
              status: 1,
            },
          },
        )
        .toArray()
    : [];
  const metrics = buildOwnerDeviceMetrics(deviceRows);

  return rows.map((row) => {
    const employeeCode = String(row.employeeCode ?? "");
    const ownerMetrics = metrics.get(employeeCode);

    return {
      employeeCode,
      name: String(row.name ?? ""),
      department: String(row.department ?? ""),
      phone: String(row.phone ?? ""),
      title: String(row.title ?? ""),
      status: String(row.status ?? "在职"),
      deviceCount: ownerMetrics?.assignedCount ?? 0,
      repairingCount: ownerMetrics?.repairingCount ?? 0,
    };
  });
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
  const employeeCodes = rows.map((row) => String(row.employeeCode ?? "")).filter(Boolean);
  const deviceRows = employeeCodes.length
    ? await devices
        .find(
          {
            currentOwnerCode: { $in: employeeCodes },
            status: { $in: ["已分配", "修理中"] },
          },
          {
            projection: {
              assetCode: 1,
              brand: 1,
              model: 1,
              storage: 1,
              currentOwnerCode: 1,
              status: 1,
            },
          },
        )
        .toArray()
    : [];
  const metrics = buildOwnerDeviceMetrics(deviceRows);

  return rows.map((row) => {
    const employeeCode = String(row.employeeCode ?? "");
    const ownerMetrics = metrics.get(employeeCode);

    return {
      employeeCode,
      name: String(row.name ?? ""),
      department: String(row.department ?? ""),
      phone: String(row.phone ?? ""),
      title: String(row.title ?? ""),
      status: String(row.status ?? "在职"),
      deviceCount: ownerMetrics?.assignedCount ?? 0,
      repairingCount: ownerMetrics?.repairingCount ?? 0,
    };
  });
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
