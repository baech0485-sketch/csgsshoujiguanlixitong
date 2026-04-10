import { NextResponse } from "next/server";
import { getNextDeviceCode } from "@/lib/device-data";
import { getDevicesCollection } from "@/lib/mongodb";
import { normalizeDeviceInput, type DeviceFormInput } from "@/lib/device-input";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as DeviceFormInput;
    const devices = await getDevicesCollection();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const assetCode = await getNextDeviceCode();
      const duplicate = await devices.findOne({ assetCode });
      if (duplicate) {
        continue;
      }

      const record = normalizeDeviceInput({
        ...payload,
        assetCode,
        purchaseDate: "",
        status: "待分配",
      });

      const result = await devices.insertOne(record);
      return NextResponse.json({ insertedId: result.insertedId, assetCode }, { status: 201 });
    }

    return NextResponse.json({ message: "手机编号生成失败，请重试" }, { status: 409 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "录入失败";
    return NextResponse.json({ message }, { status: 400 });
  }
}
