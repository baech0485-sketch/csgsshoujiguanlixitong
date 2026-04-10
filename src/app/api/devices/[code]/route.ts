import { NextResponse } from "next/server";
import { getDevicesCollection } from "@/lib/mongodb";
import { normalizeDevicePatch, type DeviceFormInput } from "@/lib/device-input";

type RouteContext = {
  params: Promise<{
    code: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { code } = await context.params;
  const devices = await getDevicesCollection();
  const device = await devices.findOne({ assetCode: code });

  if (!device) {
    return NextResponse.json({ message: "设备不存在" }, { status: 404 });
  }

  return NextResponse.json(device);
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { code } = await context.params;
    const payload = (await request.json()) as Partial<DeviceFormInput>;
    const patch = normalizeDevicePatch(payload);
    const devices = await getDevicesCollection();
    const result = await devices.findOneAndUpdate(
      { assetCode: code },
      {
        $set: patch,
      },
      {
        returnDocument: "after",
      },
    );

    if (!result) {
      return NextResponse.json({ message: "设备不存在" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新失败";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const { code } = await context.params;
  const devices = await getDevicesCollection();
  const result = await devices.deleteOne({ assetCode: code });

  if (!result.deletedCount) {
    return NextResponse.json({ message: "设备不存在" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
