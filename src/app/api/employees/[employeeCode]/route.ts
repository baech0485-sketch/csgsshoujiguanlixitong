import { NextResponse } from "next/server";
import { normalizeEmployeePatch } from "@/lib/employee-patch";
import { getEmployeesCollection } from "@/lib/mongodb";

type RouteContext = {
  params: Promise<{
    employeeCode: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { employeeCode } = await context.params;
    const payload = (await request.json()) as Parameters<typeof normalizeEmployeePatch>[0];
    const patch = normalizeEmployeePatch(payload);
    const employees = await getEmployeesCollection();
    const result = await employees.findOneAndUpdate(
      { employeeCode },
      { $set: patch },
      { returnDocument: "after" },
    );

    if (!result) {
      return NextResponse.json({ message: "员工不存在" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "员工更新失败";
    return NextResponse.json({ message }, { status: 400 });
  }
}
