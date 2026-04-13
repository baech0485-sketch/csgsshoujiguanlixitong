import { formatBeijingDateTime } from "@/lib/date-time";
import { buildDeviceMongoQuery, type DeviceFilters, type DeviceListRow } from "@/lib/device-listing";
import { buildStatusCountMap, type StatusCountRow } from "@/lib/device-ownership";
import { buildDeviceStatusCards } from "@/lib/device-status-summary";
import { buildServerPagination } from "@/lib/pagination";

type DeviceDocument = Record<string, unknown>;

type DeviceCursorLike = {
  sort: (sort: Record<string, 1 | -1>) => {
    skip: (value: number) => {
      limit: (value: number) => {
        toArray: () => Promise<DeviceDocument[]>;
      };
    };
  };
};

type DeviceAggregateLike = {
  toArray: () => Promise<Record<string, unknown>[]>;
};

export type DeviceCollectionLike = {
  countDocuments: (query: Record<string, unknown>) => Promise<number>;
  find: (query: Record<string, unknown>, options: { projection: Record<string, 1> }) => DeviceCursorLike;
  aggregate: (pipeline: Record<string, unknown>[]) => DeviceAggregateLike;
  findOne: (
    query: Record<string, unknown>,
    options: { projection: Record<string, 1> },
  ) => Promise<DeviceDocument | null>;
  createIndexes?: (indexes: Array<{ key: Record<string, 1 | -1>; name: string }>) => Promise<unknown>;
};

export const DEVICE_LIST_PROJECTION = {
  assetCode: 1,
  brand: 1,
  model: 1,
  storage: 1,
  currentOwner: 1,
  status: 1,
  updatedAt: 1,
} as const;

export const DEVICE_PREVIEW_PROJECTION = {
  ...DEVICE_LIST_PROJECTION,
  photoDataUrl: 1,
} as const;

export const DEVICE_PAGE_INDEX_SPECS = [
  { key: { updatedAt: -1 }, name: "updatedAt_desc" },
  { key: { currentOwner: 1, updatedAt: -1 }, name: "currentOwner_updatedAt" },
] as const;

let devicePageIndexesReady: Promise<unknown> | null = null;

export function resetDevicePageIndexesForTests() {
  devicePageIndexesReady = null;
}

function mapDeviceRow(row: DeviceDocument): DeviceListRow {
  const photoDataUrl = row.photoDataUrl ? String(row.photoDataUrl) : undefined;

  return {
    code: String(row.assetCode ?? ""),
    model: `${String(row.brand ?? "")} ${String(row.model ?? "")} / ${String(row.storage ?? "")}`.trim(),
    owner: row.currentOwner ? String(row.currentOwner) : "库存",
    status: String(row.status ?? "待分配"),
    date: formatBeijingDateTime(row.updatedAt ? String(row.updatedAt) : ""),
    tone: "selected",
    brand: String(row.brand ?? ""),
    photoDataUrl,
  };
}

function getOwnerOptionsPipeline() {
  return [
    {
      $project: {
        owner: {
          $cond: [
            { $or: [{ $eq: ["$currentOwner", null] }, { $eq: ["$currentOwner", ""] }] },
            "库存",
            "$currentOwner",
          ],
        },
      },
    },
    { $group: { _id: "$owner" } },
    { $sort: { _id: 1 } },
  ];
}

function getStatusCountPipeline() {
  return [{ $group: { _id: "$status", count: { $sum: 1 } } }];
}

async function ensureDevicePageIndexes(collection: DeviceCollectionLike) {
  if (!collection.createIndexes) return;

  if (!devicePageIndexesReady) {
    devicePageIndexesReady = collection.createIndexes([...DEVICE_PAGE_INDEX_SPECS]);
  }

  await devicePageIndexesReady;
}

export async function getDevicePageDataFromCollection(
  collection: DeviceCollectionLike,
  filters: DeviceFilters,
  pageInput: number,
  selectedCode: string,
) {
  await ensureDevicePageIndexes(collection);

  const query = buildDeviceMongoQuery(filters);
  const totalItemsPromise = collection.countDocuments(query);
  const ownerRowsPromise = collection.aggregate(getOwnerOptionsPipeline()).toArray();
  const statusRowsPromise = collection.aggregate(getStatusCountPipeline()).toArray();
  const selectedRowFromParamPromise = selectedCode
    ? collection.findOne({ assetCode: selectedCode }, { projection: DEVICE_PREVIEW_PROJECTION })
    : Promise.resolve(null);

  const totalItems = await totalItemsPromise;
  const pagination = buildServerPagination(totalItems, pageInput, 10);
  const rowsPromise = collection
    .find(query, { projection: DEVICE_LIST_PROJECTION })
    .sort({ updatedAt: -1 })
    .skip(pagination.skip)
    .limit(pagination.limit)
    .toArray();

  const [rows, ownerRows, statusRows, selectedRowFromParam] = await Promise.all([
    rowsPromise,
    ownerRowsPromise,
    statusRowsPromise,
    selectedRowFromParamPromise,
  ]);

  const mappedRows = rows.map((row) => mapDeviceRow(row));
  const fallbackSelectedCode = selectedCode || mappedRows[0]?.code || "";
  const selectedRow = selectedRowFromParam || (
    fallbackSelectedCode
      ? await collection.findOne({ assetCode: fallbackSelectedCode }, { projection: DEVICE_PREVIEW_PROJECTION })
      : null
  );
  const statusCounts = buildStatusCountMap(statusRows as StatusCountRow[]);
  const total = Object.values(statusCounts).reduce((sum, value) => sum + value, 0);

  return {
    rows: mappedRows,
    owners: ownerRows.map((row) => String(row._id ?? "")).filter(Boolean),
    selectedRow: selectedRow ? mapDeviceRow(selectedRow) : null,
    pagination,
    statusCards: buildDeviceStatusCards({
      total,
      pending: statusCounts["待分配"] ?? 0,
      assigned: statusCounts["已分配"] ?? 0,
      repairing: statusCounts["修理中"] ?? 0,
    }),
  };
}

export async function getDevicePageData(filters: DeviceFilters, pageInput: number, selectedCode: string) {
  try {
    const { getDevicesCollection } = await import("@/lib/mongodb");
    const devices = await getDevicesCollection();
    return await getDevicePageDataFromCollection(devices, filters, pageInput, selectedCode);
  } catch {
    return {
      rows: [] as DeviceListRow[],
      owners: [] as string[],
      selectedRow: null,
      pagination: buildServerPagination(0, pageInput, 10),
      statusCards: buildDeviceStatusCards({ total: 0, pending: 0, assigned: 0, repairing: 0 }),
    };
  }
}
