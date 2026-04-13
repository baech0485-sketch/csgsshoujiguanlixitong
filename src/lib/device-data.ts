import { buildNextDeviceCode } from "@/lib/device-input";

export async function resolveOptionalDeviceCode(loader: () => Promise<string>) {
  try {
    return await loader();
  } catch {
    return "";
  }
}

export async function getNextDeviceCode() {
  const { getDevicesCollection } = await import("@/lib/mongodb");
  const devices = await getDevicesCollection();
  const rows = await devices.find({}, { projection: { assetCode: 1 } }).toArray();
  return buildNextDeviceCode(rows.map((item) => String(item.assetCode ?? "")));
}

export async function getOptionalNextDeviceCode() {
  return resolveOptionalDeviceCode(getNextDeviceCode);
}
