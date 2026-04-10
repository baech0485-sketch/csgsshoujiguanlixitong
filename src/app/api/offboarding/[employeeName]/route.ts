import { NextResponse } from "next/server";
import { getOffboardingCollection } from "@/lib/mongodb";

type RouteContext = {
  params: Promise<{
    employeeName: string;
  }>;
};

export async function PATCH(_: Request, context: RouteContext) {
  const { employeeName } = await context.params;
  const offboarding = await getOffboardingCollection();

  const result = await offboarding.findOneAndUpdate(
    { employeeName, status: "待关闭" },
    { $set: { status: "已完成", updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!result) {
    return NextResponse.json({ message: "未找到可关闭的离职流程" }, { status: 404 });
  }

  return NextResponse.json(result);
}
