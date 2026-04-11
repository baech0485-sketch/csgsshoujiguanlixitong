import { ObjectId } from "mongodb";
import { buildOwnerDeviceMetrics } from "@/lib/device-ownership";
import { getDevicesCollection, getEmployeesCollection, getIncidentsCollection } from "@/lib/mongodb";
import { buildServerPagination } from "@/lib/pagination";

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

function mapIncidentRecord(row: Record<string, unknown>): IncidentRecordRow {
  return {
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
  };
}

export async function getIncidentWorkspaceView(pageInput = 1, pageSize = 10) {
  const employees = await getEmployeesCollection();
  const devices = await getDevicesCollection();
  const incidents = await getIncidentsCollection();

  const recordQuery = { workflowType: "employee_incident" };
  const [employeeRows, recordTotal, incidentRows, repairingDeviceRows] = await Promise.all([
    employees.find({ status: "在职" }).sort({ updatedAt: -1 }).limit(100).toArray(),
    incidents.countDocuments(recordQuery),
    incidents.find(recordQuery).sort({ updatedAt: -1 }).skip((pageInput - 1) * pageSize).limit(pageSize).toArray(),
    devices.find({ status: "修理中" }).sort({ updatedAt: -1 }).limit(60).toArray(),
  ]);
  const employeeCodes = employeeRows.map((row) => String(row.employeeCode ?? "")).filter(Boolean);
  const ownedDeviceRows = employeeCodes.length
    ? await devices
        .find(
          { currentOwnerCode: { $in: employeeCodes } },
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
      label: `${String(row.name ?? "")} · ${employeeCode} · ${String(row.department ?? "")}`,
      devices: metrics?.devices ?? [],
    };
  });

  const records = incidentRows.map((row) => mapIncidentRecord(row as Record<string, unknown>));
  const summary = {
    pending: await incidents.countDocuments({ workflowType: "employee_incident", status: "待员工确认" }),
    repairing: repairingDeviceRows.length,
    lost: await incidents.countDocuments({ workflowType: "employee_incident", type: "丢失" }),
  };

  const confirmedByDevice = new Map(
    (await incidents.find({ workflowType: "employee_incident", status: "已确认" }).toArray())
      .map((row) => mapIncidentRecord(row as Record<string, unknown>))
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
    pagination: buildServerPagination(recordTotal, pageInput, pageSize),
  };
}
