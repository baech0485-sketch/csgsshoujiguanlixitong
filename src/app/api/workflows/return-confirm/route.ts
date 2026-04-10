import { NextResponse } from "next/server";
import { logDeviceEvent } from "@/lib/device-events";
import { getDevicesCollection, getEmployeesCollection, getOffboardingCollection } from "@/lib/mongodb";
import { normalizeReturnConfirmInput } from "@/lib/return-confirm-input";

export async function POST(request: Request) {
  try {
    const payload = normalizeReturnConfirmInput((await request.json()) as { token: string; signedByAgreement: boolean });
    const devices = await getDevicesCollection();
    const employees = await getEmployeesCollection();
    const offboarding = await getOffboardingCollection();
    const record = await offboarding.findOne({ confirmToken: payload.token });

    if (!record) {
      return NextResponse.json({ message: "归还链接不存在" }, { status: 404 });
    }

    const deviceCodes = Array.isArray(record.deviceCodes) ? record.deviceCodes.map(String) : [];
    const updatedAt = payload.confirmedAt;

    await devices.updateMany(
      { assetCode: { $in: deviceCodes } },
      {
        $set: {
          currentOwnerCode: null,
          currentOwner: null,
          currentDepartment: null,
          status: "待分配",
          updatedAt,
        },
      },
    );

    await employees.updateOne(
      { employeeCode: String(record.employeeCode ?? "") },
      { $set: { status: "离职", updatedAt } },
    );

    await offboarding.updateOne(
      { _id: record._id },
      {
        $set: {
          status: "已回收",
          signatureImage: "",
          confirmationMethod: payload.confirmationMethod,
          signedAt: updatedAt,
          confirmedAt: updatedAt,
          updatedAt,
        },
      },
    );

    await Promise.all(
      deviceCodes.map((deviceCode) =>
        logDeviceEvent({
          assetCode: deviceCode,
          type: "return_confirmed",
          title: "设备已归还入库并转为待分配",
          actor: String(record.employeeName ?? "员工"),
        })),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "归还确认失败";
    return NextResponse.json({ message }, { status: 400 });
  }
}
