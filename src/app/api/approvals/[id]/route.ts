import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { logDeviceEvent } from "@/lib/device-events";
import { getApprovalsCollection, getDevicesCollection } from "@/lib/mongodb";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const payload = (await request.json()) as { status?: string };
  const status = payload.status?.trim();

  if (!status) {
    return NextResponse.json({ message: "缺少状态" }, { status: 400 });
  }

  const approvals = await getApprovalsCollection();
  const result = await approvals.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { status, updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!result) {
    return NextResponse.json({ message: "审批不存在" }, { status: 404 });
  }

  return NextResponse.json(result);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const approvals = await getApprovalsCollection();
  const devices = await getDevicesCollection();
  const approval = await approvals.findOne({ _id: new ObjectId(id) });

  if (!approval) {
    return NextResponse.json({ message: "领取确认记录不存在" }, { status: 404 });
  }

  const deviceCodes = Array.isArray(approval.deviceCodes)
    ? approval.deviceCodes.map(String).filter(Boolean)
    : [String(approval.deviceCode ?? "")].filter(Boolean);

  await approvals.deleteOne({ _id: new ObjectId(id) });

  if (approval.status !== "已领取" && deviceCodes.length) {
    const updatedAt = new Date();
    await devices.updateMany(
      { assetCode: { $in: deviceCodes } },
      {
        $set: {
          status: "待分配",
          updatedAt,
        },
        $unset: {
          currentOwner: "",
          currentOwnerCode: "",
          currentDepartment: "",
        },
      },
    );

    await Promise.all(
      deviceCodes.map((assetCode) =>
        logDeviceEvent({
          assetCode,
          type: "assignment_deleted",
          title: "领取确认记录已删除",
          actor: "系统",
          description: `员工 ${String(approval.employeeName ?? "")} 的待领取记录已删除，手机恢复为待分配。`,
        }),
      ),
    );
  }

  return NextResponse.json({ ok: true });
}
