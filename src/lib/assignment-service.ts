import { normalizeAssignmentInput } from "@/lib/assignment-input";
import { inferDeviceLocation } from "@/lib/device-listing";
import { buildWorkflowUrl, createWorkflowToken } from "@/lib/workflow-links";

type AssignmentCommand = {
  employeeCode: string;
  deviceCode: string;
  baseUrl: string;
};

type BatchAssignmentCommand = {
  employeeCode: string;
  deviceCodes: string[];
  baseUrl: string;
};

type AssignmentDeps = {
  findEmployeeByCode: (employeeCode: string) => Promise<{
    employeeCode: string;
    name: string;
    department: string;
    status: string;
  } | null>;
  findDeviceByCode: (deviceCode: string) => Promise<{
    assetCode: string;
    brand: string;
    model: string;
    storage: string;
    status: string;
  } | null>;
  updateDevice: (deviceCode: string, patch: Record<string, unknown>) => Promise<unknown>;
  createApproval: (record: Record<string, unknown>) => Promise<{ id: string }>;
  logEvent: (record: {
    assetCode: string;
    type: string;
    title: string;
    actor: string;
    description?: string;
  }) => Promise<unknown>;
};

function getDeviceTitle(device: { brand: string; model: string; storage: string }) {
  return `${device.brand} ${device.model} · ${device.storage}`.trim();
}

async function resolveEmployee(employeeCode: string, deps: AssignmentDeps) {
  const employee = await deps.findEmployeeByCode(employeeCode);
  if (!employee) {
    throw new Error("员工不存在");
  }

  if (employee.status !== "在职") {
    throw new Error("离职员工无法分配手机");
  }

  return employee;
}

async function resolveDevice(deviceCode: string, deps: AssignmentDeps) {
  const device = await deps.findDeviceByCode(deviceCode);
  if (!device) {
    throw new Error("设备不存在");
  }

  if (device.status !== "待分配") {
    throw new Error("当前设备状态不允许再次分配");
  }

  return device;
}

async function createAssignmentBatchRecord(
  command: { baseUrl: string },
  employee: {
    employeeCode: string;
    name: string;
    department: string;
  },
  devices: Array<{
    assetCode: string;
    brand: string;
    model: string;
    storage: string;
  }>,
  deps: AssignmentDeps,
) {
  const primaryDevice = devices[0];
  if (!primaryDevice) {
    throw new Error("请至少选择一台设备");
  }
  const record = normalizeAssignmentInput({
    employeeCode: employee.employeeCode,
    employeeName: employee.name,
    department: employee.department,
    deviceCode: primaryDevice.assetCode,
    deviceTitle: getDeviceTitle(primaryDevice),
  });
  const confirmToken = createWorkflowToken();
  const confirmUrl = buildWorkflowUrl(command.baseUrl, "/m/receipt-confirm", confirmToken);
  const deviceItems = devices.map((device) => ({
    deviceCode: device.assetCode,
    deviceTitle: getDeviceTitle(device),
    location: inferDeviceLocation(device.assetCode),
  }));

  const approvalRecord = {
    type: "手机领用",
    workflowType: "assignment_receipt",
    title: `${record.employeeName} 领取 ${deviceItems.length} 台手机`,
    description: `${record.department} / 待员工领取确认`,
    requester: record.employeeName,
    department: record.department,
    employeeCode: record.employeeCode,
    employeeName: record.employeeName,
    deviceCode: record.deviceCode,
    deviceTitle: record.deviceTitle,
    assignedDeviceCode: record.deviceCode,
    deviceCodes: deviceItems.map((item) => item.deviceCode),
    devices: deviceItems,
    status: record.status,
    confirmToken,
    confirmUrl,
    confirmationMethod: "",
    signatureImage: "",
    signedAt: null,
    confirmedAt: null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };

  const created = await deps.createApproval(approvalRecord);
  for (const device of deviceItems) {
    await deps.updateDevice(device.deviceCode, {
      currentOwnerCode: record.employeeCode,
      currentOwner: record.employeeName,
      currentDepartment: record.department,
      status: "已分配",
      lastAssignmentApprovalId: created.id,
      updatedAt: record.updatedAt,
    });

    await deps.logEvent({
      assetCode: device.deviceCode,
      type: "assignment_created",
      title: `设备已分配给 ${record.employeeName}`,
      actor: "资产管理员",
      description: `确认链接：${confirmUrl}`,
    });
  }

  return {
    approvalId: created.id,
    confirmToken,
    confirmUrl,
    status: "待领取",
    deviceCodes: deviceItems.map((item) => item.deviceCode),
    devices: deviceItems,
    deviceCount: deviceItems.length,
    deviceSummary: deviceItems.map((item) => item.deviceCode).join("、"),
  };
}

export async function executeAssignment(command: AssignmentCommand, deps: AssignmentDeps) {
  const employee = await resolveEmployee(command.employeeCode, deps);
  const device = await resolveDevice(command.deviceCode, deps);
  return createAssignmentBatchRecord(command, employee, [device], deps);
}

export async function executeAssignments(command: BatchAssignmentCommand, deps: AssignmentDeps) {
  const deviceCodes = [...new Set(command.deviceCodes.map((code) => code.trim()).filter(Boolean))];
  if (!deviceCodes.length) {
    throw new Error("请至少选择一台设备");
  }

  const employee = await resolveEmployee(command.employeeCode, deps);
  const devices = await Promise.all(deviceCodes.map((deviceCode) => resolveDevice(deviceCode, deps)));
  const record = await createAssignmentBatchRecord(command, employee, devices, deps);

  return {
    records: [record],
    confirmUrl: record.confirmUrl,
    confirmUrls: [record.confirmUrl],
    status: "待领取",
  };
}
