import { buildNextDeviceCode } from "@/lib/device-input";
import { getDevicesCollection } from "@/lib/mongodb";

export async function getNextDeviceCode() {
  const devices = await getDevicesCollection();
  const rows = await devices.find({}, { projection: { assetCode: 1 } }).toArray();
  return buildNextDeviceCode(rows.map((item) => String(item.assetCode ?? "")));
}
