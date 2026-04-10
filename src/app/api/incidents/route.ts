import { NextResponse } from "next/server";
import { buildWorkflowUrl, createWorkflowToken } from "@/lib/workflow-links";
import { logDeviceEvent } from "@/lib/device-events";
import { normalizeIncidentCreateInput } from "@/lib/incident-create-input";
import { getDevicesCollection, getEmployeesCollection, getIncidentsCollection } from "@/lib/mongodb";
import { normalizeIncidentInput, type IncidentInput } from "@/lib/workflow-input";

export async function GET() {
  const incidents = await getIncidentsCollection();
  const rows = await incidents.find().sort({ updatedAt: -1 }).limit(100).toArray();
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as IncidentInput & {
      employeeCode?: string;
      deviceCode?: string;
    };
    const incidents = await getIncidentsCollection();
    const devices = await getDevicesCollection();
    const employees = await getEmployeesCollection();

    if (payload.employeeCode || payload.deviceCode) {
      const record = normalizeIncidentCreateInput({
        employeeCode: payload.employeeCode || "",
        deviceCode: payload.deviceCode || "",
        type: payload.type,
        description: payload.description,
      });
      const employee = await employees.findOne({
        employeeCode: record.employeeCode,
        status: "在职",
      });
      if (!employee) {
        return NextResponse.json({ message: "员工不存在或已离职" }, { status: 404 });
      }

      const device = await devices.findOne({
        assetCode: record.deviceCode,
        currentOwnerCode: record.employeeCode,
      });
      if (!device) {
        return NextResponse.json({ message: "该员工名下不存在这台手机" }, { status: 404 });
      }

      if (String(device.status ?? "") === "修理中") {
        return NextResponse.json({ message: "该手机已在维修中" }, { status: 409 });
      }

      const pendingRecord = await incidents.findOne({
        assetCode: record.deviceCode,
        workflowType: "employee_incident",
        status: "待员工确认",
      });
      if (pendingRecord) {
        return NextResponse.json({ message: "该手机已存在待确认的异常链接" }, { status: 409 });
      }

      const confirmToken = createWorkflowToken();
      const confirmUrl = buildWorkflowUrl(new URL(request.url).origin, "/m/incident-confirm", confirmToken);
      await incidents.insertOne({
        workflowType: "employee_incident",
        employeeCode: record.employeeCode,
        employeeName: String(employee.name ?? ""),
        department: String(employee.department ?? ""),
        assetCode: record.deviceCode,
        deviceTitle: `${String(device.brand ?? "")} ${String(device.model ?? "")} · ${String(device.storage ?? "")}`.trim(),
        type: record.type,
        description: record.description,
        status: "待员工确认",
        confirmToken,
        confirmUrl,
        confirmationMethod: "",
        createdAt: record.createdAt,
        updatedAt: record.createdAt,
      });

      await logDeviceEvent({
        assetCode: record.deviceCode,
        type: "incident_requested",
        title: `异常待确认：${record.type}`,
        actor: "管理员",
        description: `异常确认链接：${confirmUrl}`,
      });

      return NextResponse.json({ ok: true, confirmUrl }, { status: 201 });
    }

    const record = normalizeIncidentInput(payload);
    await incidents.insertOne(record);

    if (record.type === "损坏" || record.type === "送修申请") {
      await devices.updateOne(
        { assetCode: record.assetCode },
        { $set: { status: "修理中", updatedAt: new Date() } },
      );
    }

    await logDeviceEvent({
      assetCode: record.assetCode,
      type: "incident_created",
      title: `异常申报：${record.type}`,
      actor: "销售",
      description: record.description,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "异常申报失败";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as {
      assetCode?: string;
      action?: string;
    };
    const assetCode = String(payload.assetCode ?? "").trim();

    if (!assetCode || payload.action !== "completeRepair") {
      return NextResponse.json({ message: "缺少维修完成所需参数" }, { status: 400 });
    }

    const incidents = await getIncidentsCollection();
    const devices = await getDevicesCollection();
    const device = await devices.findOne({ assetCode });

    if (!device || String(device.status ?? "") !== "修理中") {
      return NextResponse.json({ message: "当前手机不在维修中" }, { status: 404 });
    }

    const updatedAt = new Date();
    const nextStatus = device.currentOwnerCode ? "已分配" : "待分配";

    await devices.updateOne(
      { assetCode },
      { $set: { status: nextStatus, updatedAt } },
    );

    await incidents.updateMany(
      { assetCode, workflowType: "employee_incident", status: "已确认" },
      { $set: { status: "已修复", repairedAt: updatedAt, updatedAt } },
    );

    await logDeviceEvent({
      assetCode,
      type: "repair_completed",
      title: `设备维修完成并恢复为${nextStatus}`,
      actor: "资产管理员",
    });

    return NextResponse.json({ ok: true, status: nextStatus });
  } catch (error) {
    const message = error instanceof Error ? error.message : "维修完成处理失败";
    return NextResponse.json({ message }, { status: 400 });
  }
}
