import { buildOwnerDeviceMetrics } from "@/lib/device-ownership";
import { getDevicesCollection, getEmployeesCollection } from "@/lib/mongodb";

export type ExchangeEmployeeOption = {
  employeeCode: string;
  name: string;
  department: string;
  label: string;
  deviceCount: number;
  devices: Array<{
    deviceCode: string;
    deviceTitle: string;
    status: string;
    location: string;
  }>;
};

export type ExchangeWorkspaceSummary = {
  employeeCount: number;
  deviceCount: number;
};

export async function getExchangeWorkspaceView() {
  const employees = await getEmployeesCollection();
  const devices = await getDevicesCollection();

  const [employeeRows, deviceRows] = await Promise.all([
    employees.find({ status: "在职" }).sort({ updatedAt: -1 }).limit(100).toArray(),
    devices
      .find(
        {
          status: "已分配",
          currentOwnerCode: { $exists: true, $nin: ["", null] },
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
      .toArray(),
  ]);

  const metrics = buildOwnerDeviceMetrics(deviceRows);
  const items = employeeRows
    .map((row) => {
      const employeeCode = String(row.employeeCode ?? "");
      const ownerMetrics = metrics.get(employeeCode);
      return {
        employeeCode,
        name: String(row.name ?? ""),
        department: String(row.department ?? ""),
        label: `${String(row.name ?? "")} · ${employeeCode} · ${String(row.department ?? "")}`,
        deviceCount: ownerMetrics?.assignedCount ?? 0,
        devices: ownerMetrics?.devices.filter((device) => device.status === "已分配") ?? [],
      };
    });

  return {
    employees: items,
    summary: {
      employeeCount: items.length,
      deviceCount: items.reduce((total, item) => total + item.deviceCount, 0),
    } satisfies ExchangeWorkspaceSummary,
  };
}
