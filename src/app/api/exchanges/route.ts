import { NextResponse } from "next/server";
import { executeDeviceExchange } from "@/lib/device-exchange-service";
import { logDeviceEvent } from "@/lib/device-events";
import { syncExchangeWorkflows } from "@/lib/exchange-workflow-sync";
import { getApprovalsCollection, getDevicesCollection, getEmployeesCollection } from "@/lib/mongodb";

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    mode?: string;
    sourceEmployeeCode?: string;
    targetEmployeeCode?: string;
    sourceDeviceCodes?: string[];
    targetDeviceCodes?: string[];
  };

  const employees = await getEmployeesCollection();
  const devices = await getDevicesCollection();
  const approvals = await getApprovalsCollection();

  try {
    const result = await executeDeviceExchange(
      {
        mode: payload.mode === "unidirectional" ? "unidirectional" : "bidirectional",
        sourceEmployeeCode: payload.sourceEmployeeCode || "",
        targetEmployeeCode: payload.targetEmployeeCode || "",
        sourceDeviceCodes: Array.isArray(payload.sourceDeviceCodes) ? payload.sourceDeviceCodes : [],
        targetDeviceCodes: Array.isArray(payload.targetDeviceCodes) ? payload.targetDeviceCodes : [],
      },
      {
        findEmployeeByCode: async (employeeCode) => {
          const employee = await employees.findOne({ employeeCode });
          if (!employee) {
            return null;
          }
          return {
            employeeCode: String(employee.employeeCode ?? ""),
            name: String(employee.name ?? ""),
            department: String(employee.department ?? ""),
            status: String(employee.status ?? ""),
          };
        },
        findDevicesByCodes: async (deviceCodes) => {
          const rows = await devices
            .find({ assetCode: { $in: deviceCodes } })
            .project({
              assetCode: 1,
              brand: 1,
              model: 1,
              storage: 1,
              status: 1,
              currentOwnerCode: 1,
            })
            .toArray();

          return rows.map((row) => ({
            assetCode: String(row.assetCode ?? ""),
            brand: String(row.brand ?? ""),
            model: String(row.model ?? ""),
            storage: String(row.storage ?? ""),
            status: String(row.status ?? ""),
            currentOwnerCode: String(row.currentOwnerCode ?? ""),
          }));
        },
        hasPendingReceipt: async (deviceCode) => {
          const pendingRecord = await approvals.findOne({
            workflowType: "assignment_receipt",
            status: "待领取",
            $or: [
              { deviceCode },
              { deviceCodes: deviceCode },
            ],
          });
          return Boolean(pendingRecord);
        },
        updateDeviceOwner: (deviceCode, patch) =>
          devices.updateOne({ assetCode: deviceCode }, { $set: patch }),
        syncOpenWorkflows: syncExchangeWorkflows,
        logEvent: logDeviceEvent,
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "手机交换失败";
    return NextResponse.json({ message }, { status: 400 });
  }
}
