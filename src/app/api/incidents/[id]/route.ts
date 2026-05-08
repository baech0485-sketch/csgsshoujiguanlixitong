import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { logDeviceEvent } from "@/lib/device-events";
import { getIncidentsCollection } from "@/lib/mongodb";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: "异常确认记录不存在" }, { status: 404 });
  }

  const incidents = await getIncidentsCollection();
  const incident = await incidents.findOne({
    _id: new ObjectId(id),
    workflowType: "employee_incident",
  });

  if (!incident) {
    return NextResponse.json({ message: "异常确认记录不存在" }, { status: 404 });
  }

  if (String(incident.status ?? "") !== "待员工确认") {
    return NextResponse.json({ message: "已确认的异常记录已锁定，不允许删除" }, { status: 409 });
  }

  await incidents.deleteOne({ _id: new ObjectId(id) });

  await logDeviceEvent({
    assetCode: String(incident.assetCode ?? ""),
    type: "incident_deleted",
    title: "异常确认记录已删除",
    actor: "系统",
    description: `员工 ${String(incident.employeeName ?? "")} 的待确认异常记录已删除。`,
  });

  return NextResponse.json({ ok: true });
}
