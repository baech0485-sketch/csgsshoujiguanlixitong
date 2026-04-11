import { NextResponse } from "next/server";
import { getEmployeesViewByDepartment, getNextEmployeeCode } from "@/lib/employee-data";
import { normalizeEmployeeInput, type EmployeeInput } from "@/lib/employee-input";
import { getEmployeesCollection } from "@/lib/mongodb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const rows = await getEmployeesViewByDepartment(search, "在职", "", 1, 200);
  return NextResponse.json(rows.items);
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as EmployeeInput;
    const employees = await getEmployeesCollection();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const employeeCode = await getNextEmployeeCode();
      const duplicate = await employees.findOne({ employeeCode });
      if (duplicate) {
        continue;
      }
      const record = normalizeEmployeeInput({
        ...payload,
        employeeCode,
      });

      const result = await employees.insertOne(record);
      return NextResponse.json({ insertedId: result.insertedId, employeeCode }, { status: 201 });
    }

    return NextResponse.json({ message: "员工编号生成失败，请重试" }, { status: 409 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "员工创建失败";
    return NextResponse.json({ message }, { status: 400 });
  }
}
