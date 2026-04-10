import { ObjectId } from "mongodb";
import { getDevicesCollection, getEmployeesCollection, getIncidentsCollection } from "@/lib/mongodb";

export type IncidentEmployeeOption = {
  employeeCode: string;
  label: string;
  devices: Array<{
    deviceCode: string;
    deviceTitle: string;
    status: string;
  }>;
};

export type IncidentRecordRow = {
  id: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  deviceCode: string;
  deviceTitle: string;
  type: string;
  status: string;
  description: string;
  confirmUrl: string;
  confirmationMethod: string;
  confirmedAt: string;
};

export type RepairQueueRow = {
  deviceCode: string;
  deviceTitle: string;
  employeeName: string;
  department: string;
  incidentType: string;
  confirmedAt: string;
};

export type IncidentSummary = {
  pending: number;
  repairing: number;
  lost: number;
};

export async function getIncidentWorkspaceView() {
  const employees = await getEmployeesCollection();
  const devices = await getDevicesCollection();
  const incidents = await getIncidentsCollection();

  const [employeeRows, incidentRows, repairingDeviceRows] = await Promise.all([
    employees.find({ status: "在职" }).sort({ updatedAt: -1 }).limit(100).toArray(),
    incidents.find({ workflowType: "employee_incident" }).sort({ updatedAt: -1 }).limit(120).toArray(),
    devices.find({ status: "修理中" }).sort({ updatedAt: -1 }).limit(60).toArray(),
  ]);

  const employeeOptions = await Promise.all(
    employeeRows.map(async (row) => {
      const ownedDevices = await devices
        .find({ currentOwnerCode: String(row.employeeCode ?? "") })
        .sort({ updatedAt: -1 })
        .toArray();

      return {
        employeeCode: String(row.employeeCode ?? ""),
        label: `${String(row.name ?? "")} · ${String(row.employeeCode ?? "")} · ${String(row.department ?? "")}`,
        devices: ownedDevices.map((device) => ({
          deviceCode: String(device.assetCode ?? ""),
          deviceTitle: `${String(device.brand ?? "")} ${String(device.model ?? "")} · ${String(device.storage ?? "")}`.trim(),
          status: String(device.status ?? ""),
        })),
      };
    }),
  );

  const records = incidentRows.map((row) => ({
    id: String((row._id as ObjectId).toString()),
    employeeCode: String(row.employeeCode ?? ""),
    employeeName: String(row.employeeName ?? ""),
    department: String(row.department ?? ""),
    deviceCode: String(row.assetCode ?? ""),
    deviceTitle: String(row.deviceTitle ?? ""),
    type: String(row.type ?? ""),
    status: String(row.status ?? ""),
    description: String(row.description ?? ""),
    confirmUrl: String(row.confirmUrl ?? ""),
    confirmationMethod: String(row.confirmationMethod ?? ""),
    confirmedAt: row.confirmedAt
      ? new Date(String(row.confirmedAt)).toLocaleString("zh-CN", { hour12: false })
      : "",
  }));

  const summary = {
    pending: records.filter((item) => item.status === "待员工确认").length,
    repairing: repairingDeviceRows.length,
    lost: records.filter((item) => item.type === "丢失").length,
  };

  const confirmedByDevice = new Map(
    records
      .filter((item) => item.status === "已确认")
      .map((item) => [item.deviceCode, item] as const),
  );

  const repairQueue = repairingDeviceRows.map((device) => {
    const deviceCode = String(device.assetCode ?? "");
    const linkedIncident = confirmedByDevice.get(deviceCode);
    return {
      deviceCode,
      deviceTitle: `${String(device.brand ?? "")} ${String(device.model ?? "")} · ${String(device.storage ?? "")}`.trim(),
      employeeName: String(device.currentOwner ?? "未绑定员工"),
      department: String(device.currentDepartment ?? "待同步"),
      incidentType: linkedIncident?.type || "维修",
      confirmedAt: linkedIncident?.confirmedAt || "",
    };
  });

  return {
    employees: employeeOptions,
    records,
    repairQueue,
    summary,
  };
}
