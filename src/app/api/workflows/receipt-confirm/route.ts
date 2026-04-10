import { NextResponse } from "next/server";
import { logDeviceEvent } from "@/lib/device-events";
import { getApprovalsCollection, getDevicesCollection } from "@/lib/mongodb";
import { normalizeReceiptConfirmInput } from "@/lib/receipt-confirm-input";

export async function POST(request: Request) {
  try {
    const payload = normalizeReceiptConfirmInput((await request.json()) as {
      token: string;
      checklistConfirmed: boolean;
      signedByAgreement: boolean;
    });
    const approvals = await getApprovalsCollection();
    const devices = await getDevicesCollection();
    const approval = await approvals.findOne({
      workflowType: "assignment_receipt",
      confirmToken: payload.token,
    });

    if (!approval) {
      return NextResponse.json({ message: "确认链接不存在" }, { status: 404 });
    }

    const deviceCodes = Array.isArray(approval.deviceCodes)
      ? approval.deviceCodes.map(String)
      : [String(approval.deviceCode ?? "")].filter(Boolean);
    const updatedAt = payload.confirmedAt;

    await devices.updateMany(
      { assetCode: { $in: deviceCodes } },
      { $set: { status: "已分配", updatedAt } },
    );

    await approvals.updateOne(
      { _id: approval._id },
      {
        $set: {
          status: "已领取",
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
          type: "receipt_confirmed",
          title: "员工已确认领用并提交回执",
          actor: String(approval.employeeName ?? "员工"),
        }),
      ),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "确认失败";
    return NextResponse.json({ message }, { status: 400 });
  }
}
