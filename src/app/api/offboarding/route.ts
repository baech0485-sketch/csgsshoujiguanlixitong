import { NextResponse } from "next/server";
import { buildWorkflowUrl, createWorkflowToken } from "@/lib/workflow-links";
import { getDevicesCollection, getEmployeesCollection, getOffboardingCollection } from "@/lib/mongodb";

export async function GET() {
  const offboarding = await getOffboardingCollection();
  const rows = await offboarding.find().sort({ updatedAt: -1 }).limit(50).toArray();
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { employeeCode?: string; leavingDate?: string };
    const employeeCode = payload.employeeCode?.trim();
    if (!employeeCode) {
      return NextResponse.json({ message: "请选择在职员工" }, { status: 400 });
    }

    const devices = await getDevicesCollection();
    const employees = await getEmployeesCollection();
    const offboarding = await getOffboardingCollection();
    const employee = await employees.findOne({ employeeCode });

    if (!employee) {
      return NextResponse.json({ message: "员工不存在" }, { status: 404 });
    }

    if (String(employee.status ?? "") !== "在职") {
      return NextResponse.json({ message: "仅支持对在职员工发起离职回收" }, { status: 400 });
    }

    const linkedDevices = await devices
      .find({ currentOwnerCode: employeeCode, status: "已分配" })
      .project({ assetCode: 1, brand: 1, model: 1, storage: 1 })
      .toArray();

    if (!linkedDevices.length) {
      return NextResponse.json({ message: "该员工当前没有可回收手机" }, { status: 400 });
    }

    const now = new Date();
    const existing = await offboarding.findOne({
      employeeCode,
      status: "待回收",
    });

    if (existing) {
      return NextResponse.json({ message: "该员工已存在待回收链接，请直接使用当前链接" }, { status: 409 });
    }

    const confirmToken = createWorkflowToken();
    const confirmUrl = buildWorkflowUrl(new URL(request.url).origin, "/m/return-confirm", confirmToken);
    const result = await offboarding.insertOne({
      employeeCode,
      employeeName: String(employee.name ?? ""),
      department: String(employee.department ?? ""),
      leavingDate: payload.leavingDate?.trim() || now.toISOString().slice(0, 10),
      status: "待回收",
      deviceCodes: linkedDevices.map((item) => String(item.assetCode ?? "")),
      devices: linkedDevices.map((item) => ({
        deviceCode: String(item.assetCode ?? ""),
        deviceTitle: `${String(item.brand ?? "")} ${String(item.model ?? "")} · ${String(item.storage ?? "")}`.trim(),
      })),
      confirmToken,
      confirmUrl,
      confirmationMethod: "",
      signatureImage: "",
      signedAt: null,
      confirmedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ insertedId: result.insertedId }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "离职回收创建失败";
    return NextResponse.json({ message }, { status: 400 });
  }
}
