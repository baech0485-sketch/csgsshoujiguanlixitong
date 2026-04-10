import { NextResponse } from "next/server";
import { executeAssignment, executeAssignments } from "@/lib/assignment-service";
import { logDeviceEvent } from "@/lib/device-events";
import { getApprovalsCollection, getDevicesCollection, getEmployeesCollection } from "@/lib/mongodb";

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    employeeCode?: string;
    deviceCode?: string;
    deviceCodes?: string[];
  };

  const deviceCodes = Array.isArray(payload.deviceCodes)
    ? payload.deviceCodes
    : payload.deviceCode
      ? [payload.deviceCode]
      : [];

  if (!payload.employeeCode || !deviceCodes.length) {
    return NextResponse.json({ message: "缺少员工或设备信息" }, { status: 400 });
  }

  const approvals = await getApprovalsCollection();
  const employees = await getEmployeesCollection();
  const devices = await getDevicesCollection();
  const baseUrl = new URL(request.url).origin;

  try {
    const result = deviceCodes.length === 1
      ? await executeAssignment(
        { employeeCode: payload.employeeCode, deviceCode: deviceCodes[0], baseUrl },
        {
          findEmployeeByCode: (employeeCode) =>
            employees.findOne({
              employeeCode,
            }) as Promise<{
              employeeCode: string;
              name: string;
              department: string;
              status: string;
            } | null>,
          findDeviceByCode: (deviceCode) =>
            devices.findOne({
              assetCode: deviceCode,
            }) as Promise<{
              assetCode: string;
              brand: string;
              model: string;
              storage: string;
              status: string;
            } | null>,
          updateDevice: (deviceCode, patch) => devices.updateOne({ assetCode: deviceCode }, { $set: patch }),
          createApproval: async (record) => {
            const inserted = await approvals.insertOne(record);
            return { id: String(inserted.insertedId) };
          },
          logEvent: logDeviceEvent,
        },
      )
      : await executeAssignments(
        { employeeCode: payload.employeeCode, deviceCodes, baseUrl },
        {
          findEmployeeByCode: (employeeCode) =>
            employees.findOne({
              employeeCode,
            }) as Promise<{
              employeeCode: string;
              name: string;
              department: string;
              status: string;
            } | null>,
          findDeviceByCode: (deviceCode) =>
            devices.findOne({
              assetCode: deviceCode,
            }) as Promise<{
              assetCode: string;
              brand: string;
              model: string;
              storage: string;
              status: string;
            } | null>,
          updateDevice: (deviceCode, patch) => devices.updateOne({ assetCode: deviceCode }, { $set: patch }),
          createApproval: async (record) => {
            const inserted = await approvals.insertOne(record);
            return { id: String(inserted.insertedId) };
          },
          logEvent: logDeviceEvent,
        },
      );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "分配失败";
    return NextResponse.json({ message }, { status: 400 });
  }
}
