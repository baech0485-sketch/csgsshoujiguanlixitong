import { getDeviceEventsCollection } from "@/lib/mongodb";

export type DeviceEventInput = {
  assetCode: string;
  type: string;
  title: string;
  actor: string;
  description?: string;
};

export async function logDeviceEvent(input: DeviceEventInput) {
  const events = await getDeviceEventsCollection();
  await events.insertOne({
    ...input,
    createdAt: new Date(),
  });
}
