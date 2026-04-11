import { buildNextEmployeeCode } from "@/lib/employee-input";
import { buildOwnerDeviceMetrics } from "@/lib/device-ownership";
import { getDevicesCollection, getEmployeesCollection } from "@/lib/mongodb";
import { buildServerPagination } from "@/lib/pagination";

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

export type PaginatedEmployeeView = {
  items: EmployeeViewRow[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
};

function buildEmployeeQuery(search = "", status = "在职", department = "") {
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

  return query;
}

export async function getEmployeesViewByDepartment(
  search = "",
  status = "在职",
  department = "",
  pageInput = 1,
  pageSize = 10,
): Promise<PaginatedEmployeeView> {
  const employees = await getEmployeesCollection();
  const devices = await getDevicesCollection();
  const query = buildEmployeeQuery(search, status, department);
  const totalItems = await employees.countDocuments(query);
  const pagination = buildServerPagination(totalItems, pageInput, pageSize);

  const rows = await employees
    .find(query)
    .sort({ updatedAt: -1 })
    .skip(pagination.skip)
    .limit(pagination.limit)
    .toArray();
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

  const items = rows.map((row) => {
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

  return { ...pagination, items };
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
