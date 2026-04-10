import { getDevicesCollection, getEmployeesCollection, getOffboardingCollection } from "@/lib/mongodb";

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

export async function getOffboardingPageView() {
  const employees = await getEmployeesCollection();
  const devices = await getDevicesCollection();
  const offboarding = await getOffboardingCollection();

  const [employeeRows, caseRows] = await Promise.all([
    employees.find({ status: "在职" }).sort({ updatedAt: -1 }).limit(100).toArray(),
    offboarding.find().sort({ updatedAt: -1 }).limit(50).toArray(),
  ]);

  const employeeOptions = await Promise.all(
    employeeRows.map(async (row) => {
      const ownedDevices = await devices
        .find({ currentOwnerCode: String(row.employeeCode ?? ""), status: "已分配" })
        .sort({ updatedAt: -1 })
        .toArray();

      return {
        employeeCode: String(row.employeeCode ?? ""),
        label: `${String(row.employeeCode ?? "")} · ${String(row.name ?? "")} · ${String(row.department ?? "")}`,
        devices: ownedDevices.map((device) => ({
          deviceCode: String(device.assetCode ?? ""),
          deviceTitle: `${String(device.brand ?? "")} ${String(device.model ?? "")} · ${String(device.storage ?? "")}`.trim(),
        })),
      };
    }),
  );

  return {
    employees: employeeOptions,
    cases: caseRows.map((row) => ({
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
  };
}
