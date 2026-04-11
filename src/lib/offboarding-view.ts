import { buildOwnerDeviceMetrics } from "@/lib/device-ownership";
import { getDevicesCollection, getEmployeesCollection, getOffboardingCollection } from "@/lib/mongodb";
import { buildServerPagination } from "@/lib/pagination";

export type OffboardingEmployeeOption = {
  employeeCode: string;
  label: string;
  devices: Array<{
    deviceCode: string;
    deviceTitle: string;
  }>;
};

export type OffboardingCaseRow = {
  employeeCode: string;
  employeeName: string;
  department: string;
  leavingDate: string;
  status: string;
  confirmationMethod: string;
  devices: Array<{
    deviceCode: string;
    deviceTitle: string;
  }>;
  confirmUrl: string;
  signedAt: string;
};

export type PaginatedOffboardingCases = {
  items: OffboardingCaseRow[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
};

export async function getOffboardingPageView(pageInput = 1, pageSize = 10) {
  const employees = await getEmployeesCollection();
  const devices = await getDevicesCollection();
  const offboarding = await getOffboardingCollection();

  const [employeeRows, caseTotal] = await Promise.all([
    employees.find({ status: "在职" }).sort({ updatedAt: -1 }).limit(100).toArray(),
    offboarding.countDocuments({}),
  ]);
  const pagination = buildServerPagination(caseTotal, pageInput, pageSize);
  const caseRows = await offboarding
    .find()
    .sort({ updatedAt: -1 })
    .skip(pagination.skip)
    .limit(pagination.limit)
    .toArray();
  const employeeCodes = employeeRows.map((row) => String(row.employeeCode ?? "")).filter(Boolean);
  const ownedDeviceRows = employeeCodes.length
    ? await devices
        .find(
          {
            currentOwnerCode: { $in: employeeCodes },
            status: "已分配",
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
        .sort({ updatedAt: -1 })
        .toArray()
    : [];
  const ownerMetrics = buildOwnerDeviceMetrics(ownedDeviceRows);

  const employeeOptions = employeeRows.map((row) => {
    const employeeCode = String(row.employeeCode ?? "");
    const metrics = ownerMetrics.get(employeeCode);

    return {
      employeeCode,
      label: `${employeeCode} · ${String(row.name ?? "")} · ${String(row.department ?? "")}`,
      devices: metrics?.devices.map((device) => ({
        deviceCode: device.deviceCode,
        deviceTitle: device.deviceTitle,
      })) ?? [],
    };
  });

  return {
    employees: employeeOptions,
    cases: {
      ...pagination,
      items: caseRows.map((row) => ({
        employeeCode: String(row.employeeCode ?? ""),
        employeeName: String(row.employeeName ?? ""),
        department: String(row.department ?? ""),
        leavingDate: String(row.leavingDate ?? ""),
        status: String(row.status ?? ""),
        confirmationMethod: String(row.confirmationMethod ?? ""),
        devices: Array.isArray(row.devices) ? row.devices.map((item) => ({
          deviceCode: String((item as { deviceCode?: string }).deviceCode ?? ""),
          deviceTitle: String((item as { deviceTitle?: string }).deviceTitle ?? ""),
        })) : [],
        confirmUrl: String(row.confirmUrl ?? ""),
        signedAt: row.signedAt ? new Date(String(row.signedAt)).toLocaleString("zh-CN", { hour12: false }) : "",
      })),
    },
  };
}
