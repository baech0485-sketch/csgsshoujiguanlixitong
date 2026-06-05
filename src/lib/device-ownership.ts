import { inferDeviceLocation } from "@/lib/device-listing";

export type OwnedDeviceRow = {
  [key: string]: unknown;
  assetCode?: string | null;
  brand?: string | null;
  model?: string | null;
  storage?: string | null;
  currentOwnerCode?: string | null;
  status?: string | null;
};

export type OwnerDeviceMetric = {
  assignedCount: number;
  repairingCount: number;
  devices: Array<{
    deviceCode: string;
    deviceTitle: string;
    status: string;
    location: string;
  }>;
};

export type StatusCountRow = {
  _id?: string | null;
  count?: number | null;
};

function buildDeviceTitle(row: OwnedDeviceRow) {
  return `${String(row.brand ?? "")} ${String(row.model ?? "")} · ${String(row.storage ?? "")}`.trim();
}

export function buildOwnerDeviceMetrics(rows: OwnedDeviceRow[]) {
  const metrics = new Map<string, OwnerDeviceMetric>();

  for (const row of rows) {
    const ownerCode = String(row.currentOwnerCode ?? "").trim();
    if (!ownerCode) continue;

    const current = metrics.get(ownerCode) ?? {
      assignedCount: 0,
      repairingCount: 0,
      devices: [],
    };

    const status = String(row.status ?? "");
    if (status === "已分配") current.assignedCount += 1;
    if (status === "修理中") current.repairingCount += 1;

    current.devices.push({
      deviceCode: String(row.assetCode ?? ""),
      deviceTitle: buildDeviceTitle(row),
      status,
      location: inferDeviceLocation(String(row.assetCode ?? "")),
    });

    metrics.set(ownerCode, current);
  }

  return metrics;
}

export function buildStatusCountMap(rows: StatusCountRow[]) {
  return rows.reduce<Record<string, number>>((result, row) => {
    const key = String(row._id ?? "");
    if (!key) return result;
    result[key] = Number(row.count ?? 0);
    return result;
  }, {});
}
