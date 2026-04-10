import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { logDeviceEvent } from "@/lib/device-events";
import { getApprovalsCollection } from "@/lib/mongodb";
import { readCookieSession, SESSION_COOKIE_NAME } from "@/lib/session";
import { normalizeApprovalInput, type ApprovalInput } from "@/lib/workflow-input";

export async function GET() {
  const approvals = await getApprovalsCollection();
  const rows = await approvals.find().sort({ updatedAt: -1 }).limit(200).toArray();
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ApprovalInput;
    const record = normalizeApprovalInput(payload);
    const approvals = await getApprovalsCollection();
    const result = await approvals.insertOne(record);

    const session = readCookieSession((await cookies()).get(SESSION_COOKIE_NAME)?.value);
    await logDeviceEvent({
      assetCode: payload.description || payload.title,
      type: "approval_created",
      title: `审批已发起：${record.title}`,
      actor: session?.username || "系统",
      description: record.description,
    });

    return NextResponse.json({ insertedId: result.insertedId }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "审批创建失败";
    return NextResponse.json({ message }, { status: 400 });
  }
}
