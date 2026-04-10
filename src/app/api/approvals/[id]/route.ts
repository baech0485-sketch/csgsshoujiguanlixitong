import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getApprovalsCollection } from "@/lib/mongodb";

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
