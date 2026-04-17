import { getDevicesCollection, getIncidentsCollection, getOffboardingCollection } from "@/lib/mongodb";

type SyncEmployee = {
  employeeCode: string;
  name: string;
  department: string;
};

type ExchangeWorkflowSyncInput = {
  sourceEmployeeCode: string;
  targetEmployeeCode: string;
  sourceEmployee: SyncEmployee;
  targetEmployee: SyncEmployee;
  sourceDeviceCodes: string[];
  targetDeviceCodes: string[];
  updatedAt: Date;
};

function buildOffboardingDevices(rows: Array<Record<string, unknown>>) {
  return rows.map((item) => ({
    deviceCode: String(item.assetCode ?? ""),
    deviceTitle: `${String(item.brand ?? "")} ${String(item.model ?? "")} · ${String(item.storage ?? "")}`.trim(),
  }));
}

async function syncPendingIncidents(input: ExchangeWorkflowSyncInput) {
  const incidents = await getIncidentsCollection();

  await Promise.all([
    incidents.updateMany(
      {
        workflowType: "employee_incident",
        status: "待员工确认",
        employeeCode: input.sourceEmployeeCode,
        assetCode: { $in: input.sourceDeviceCodes },
      },
      {
        $set: {
          employeeCode: input.targetEmployee.employeeCode,
          employeeName: input.targetEmployee.name,
          department: input.targetEmployee.department,
          updatedAt: input.updatedAt,
        },
      },
    ),
    incidents.updateMany(
      {
        workflowType: "employee_incident",
        status: "待员工确认",
        employeeCode: input.targetEmployeeCode,
        assetCode: { $in: input.targetDeviceCodes },
      },
      {
        $set: {
          employeeCode: input.sourceEmployee.employeeCode,
          employeeName: input.sourceEmployee.name,
          department: input.sourceEmployee.department,
          updatedAt: input.updatedAt,
        },
      },
    ),
  ]);
}

async function syncPendingOffboardingCase(employeeCode: string, updatedAt: Date) {
  const offboarding = await getOffboardingCollection();
  const pendingCase = await offboarding.findOne({ employeeCode, status: "待回收" });
  if (!pendingCase) {
    return;
  }

  const devices = await getDevicesCollection();
  const linkedDevices = await devices
    .find({ currentOwnerCode: employeeCode, status: "已分配" })
    .project({ assetCode: 1, brand: 1, model: 1, storage: 1 })
    .toArray();

  await offboarding.updateOne(
    { _id: pendingCase._id },
    {
      $set: {
        deviceCodes: linkedDevices.map((item) => String(item.assetCode ?? "")),
        devices: buildOffboardingDevices(linkedDevices),
        updatedAt,
      },
    },
  );
}

export async function syncExchangeWorkflows(input: ExchangeWorkflowSyncInput) {
  await syncPendingIncidents(input);
  await Promise.all([
    syncPendingOffboardingCase(input.sourceEmployeeCode, input.updatedAt),
    syncPendingOffboardingCase(input.targetEmployeeCode, input.updatedAt),
  ]);
}
