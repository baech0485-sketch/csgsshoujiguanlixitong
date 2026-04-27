import { getApprovalsCollection, getDevicesCollection, getIncidentsCollection, getOffboardingCollection } from "@/lib/mongodb";
import { normalizeRecoveryMode } from "@/lib/recovery-mode";

export async function getReceiptConfirmRecord(token: string) {
  const approvals = await getApprovalsCollection();
  const devices = await getDevicesCollection();
  const approval = await approvals.findOne({ workflowType: "assignment_receipt", confirmToken: token });

  if (!approval) {
    return null;
  }

  const deviceCodes = Array.isArray(approval.deviceCodes)
    ? approval.deviceCodes.map(String)
    : [String(approval.deviceCode ?? "")].filter(Boolean);
  const deviceRows = await devices.find({ assetCode: { $in: deviceCodes } }).toArray();
  const firstDevice = deviceRows[0];

  return {
    employeeName: String(approval.employeeName ?? ""),
    employeeCode: String(approval.employeeCode ?? ""),
    department: String(approval.department ?? ""),
    deviceCode: String(approval.deviceCode ?? ""),
    deviceTitle: String(approval.deviceTitle ?? ""),
    deviceCount: deviceCodes.length,
    devices: deviceCodes.map((deviceCode) => {
      const device = deviceRows.find((item) => String(item.assetCode ?? "") === deviceCode);
      return {
        deviceCode,
        deviceTitle:
          device && `${String(device.brand ?? "")} ${String(device.model ?? "")} · ${String(device.storage ?? "")}`.trim(),
        serialNumber: String(device?.serialNumber ?? ""),
      };
    }),
    status: String(approval.status ?? "待领取"),
    serialNumber: String(firstDevice?.serialNumber ?? ""),
    photoDataUrl: String(firstDevice?.photoDataUrl ?? ""),
    warehousingDate: String(firstDevice?.purchaseDate ?? ""),
  };
}

export async function getReturnConfirmRecord(token: string) {
  const offboarding = await getOffboardingCollection();
  const record = await offboarding.findOne({ confirmToken: token });
  if (!record) {
    return null;
  }

  return {
    mode: normalizeRecoveryMode(String(record.mode ?? "")),
    employeeName: String(record.employeeName ?? ""),
    employeeCode: String(record.employeeCode ?? ""),
    department: String(record.department ?? ""),
    status: String(record.status ?? ""),
    leavingDate: String(record.leavingDate ?? ""),
    devices: Array.isArray(record.devices) ? record.devices.map((item) => ({
      deviceCode: String((item as { deviceCode?: string }).deviceCode ?? ""),
      deviceTitle: String((item as { deviceTitle?: string }).deviceTitle ?? ""),
    })) : [],
  };
}

export async function getIncidentConfirmRecord(token: string) {
  const incidents = await getIncidentsCollection();
  const devices = await getDevicesCollection();
  const record = await incidents.findOne({ workflowType: "employee_incident", confirmToken: token });

  if (!record) {
    return null;
  }

  const device = await devices.findOne({ assetCode: String(record.assetCode ?? "") });

  return {
    employeeName: String(record.employeeName ?? ""),
    employeeCode: String(record.employeeCode ?? ""),
    department: String(record.department ?? ""),
    deviceCode: String(record.assetCode ?? ""),
    deviceTitle: String(record.deviceTitle ?? ""),
    type: String(record.type ?? ""),
    description: String(record.description ?? ""),
    serialNumber: String(device?.serialNumber ?? ""),
    photoDataUrl: String(device?.photoDataUrl ?? ""),
  };
}
