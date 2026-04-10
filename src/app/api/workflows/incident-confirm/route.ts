import { NextResponse } from "next/server";
import { logDeviceEvent } from "@/lib/device-events";
import { normalizeIncidentConfirmInput } from "@/lib/incident-confirm-input";
import { getDevicesCollection, getIncidentsCollection } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const payload = normalizeIncidentConfirmInput((await request.json()) as {
      token: string;
      checklistConfirmed: boolean;
      signedByAgreement: boolean;
    });
    const devices = await getDevicesCollection();
    const incidents = await getIncidentsCollection();
    const record = await incidents.findOne({
      workflowType: "employee_incident",
      confirmToken: payload.token,
    });

    if (!record) {
      return NextResponse.json({ message: "异常确认链接不存在" }, { status: 404 });
    }

    const updatedAt = payload.confirmedAt;

    await devices.updateOne(
      { assetCode: String(record.assetCode ?? "") },
      { $set: { status: "修理中", updatedAt } },
    );

    await incidents.updateOne(
      { _id: record._id },
      {
        $set: {
          status: "已确认",
          confirmationMethod: payload.confirmationMethod,
          confirmedAt: updatedAt,
          updatedAt,
        },
      },
    );

    await logDeviceEvent({
      assetCode: String(record.assetCode ?? ""),
      type: "incident_confirmed",
      title: `异常已确认：${String(record.type ?? "")}`,
      actor: String(record.employeeName ?? "员工"),
      description: String(record.description ?? ""),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "异常确认失败";
    return NextResponse.json({ message }, { status: 400 });
  }
}
