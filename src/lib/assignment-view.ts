import { getDevicesCollection, getEmployeesCollection } from "@/lib/mongodb";

export type AssignmentEmployeeOption = {
  employeeCode: string;
  label: string;
};

export type AssignmentDeviceOption = {
  deviceCode: string;
  label: string;
  status: string;
};

export type AssignmentRecordRow = {
  id: string;
  employeeCode: string;
  employeeName: string;
  deviceCode: string;
  deviceTitle: string;
  status: string;
  confirmUrl: string;
};

export async function getAssignmentWorkspaceView() {
  const employees = await getEmployeesCollection();
  const devices = await getDevicesCollection();

  const [employeeRows, deviceRows] = await Promise.all([
    employees.find({ status: "在职" }).sort({ updatedAt: -1 }).limit(100).toArray(),
    devices.find({ status: "待分配" }).sort({ updatedAt: -1 }).limit(100).toArray(),
  ]);

  return {
    employees: employeeRows.map((row) => ({
      employeeCode: String(row.employeeCode ?? ""),
      label: `${String(row.employeeCode ?? "")} · ${String(row.name ?? "")} · ${String(row.department ?? "")}`,
    })),
    devices: deviceRows.map((row) => ({
      deviceCode: String(row.assetCode ?? ""),
      label: `${String(row.assetCode ?? "")} · ${String(row.brand ?? "")} ${String(row.model ?? "")} · ${String(row.storage ?? "")}`.trim(),
      status: String(row.status ?? ""),
    })),
  };
}
