export type DeviceListRow = {
  code: string;
  model: string;
  owner: string;
  status: string;
  location: string;
  date: string;
  tone: "selected" | "warning" | "success" | "danger" | "info";
  brand?: string;
  photoDataUrl?: string;
};

export type DeviceFilters = {
  search: string;
  status: string;
  brand: string;
  owner: string;
  location?: string;
};

type DeviceMongoQuery = Record<string, unknown>;
const YICHANG_DEVICE_CODES = Array.from({ length: 48 }, (_, index) => {
  const sequence = index + 1;
  return [`sj-${sequence}`, `sj-${String(sequence).padStart(2, "0")}`];
}).flat();

function normalized(value: string) {
  return value.trim().toLowerCase();
}

export function inferBrand(model: string) {
  return model.split(" ")[0] || "";
}

export function inferDeviceLocation(code: string) {
  const match = normalized(code).match(/^sj-(\d+)$/);
  if (!match) {
    return "武汉";
  }

  const sequence = Number.parseInt(match[1], 10);
  return sequence >= 1 && sequence <= 48 ? "宜昌" : "武汉";
}

export function applyDeviceFilters(rows: DeviceListRow[], filters: DeviceFilters) {
  const search = normalized(filters.search);
  const status = normalized(filters.status);
  const brand = normalized(filters.brand);
  const owner = normalized(filters.owner);
  const location = normalized(filters.location ?? "");

  return rows.filter((row) => {
    const rowBrand = normalized(row.brand || inferBrand(row.model));
    const matchesSearch = !search || normalized(row.code).includes(search) || normalized(row.model).includes(search) || normalized(row.owner).includes(search);
    const matchesStatus = !status || normalized(row.status) === status;
    const matchesBrand = !brand || rowBrand === brand;
    const matchesOwner = !owner || normalized(row.owner) === owner;
    const matchesLocation = !location || normalized(row.location) === location;

    return matchesSearch && matchesStatus && matchesBrand && matchesOwner && matchesLocation;
  });
}

export function buildDeviceMongoQuery(filters: DeviceFilters): DeviceMongoQuery {
  const query: DeviceMongoQuery = {};
  const andConditions: DeviceMongoQuery[] = [];
  const search = filters.search.trim();

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.owner) {
    if (filters.owner === "库存") {
      andConditions.push({
        $or: [
          { currentOwner: { $exists: false } },
          { currentOwner: null },
          { currentOwner: "" },
        ],
      });
    } else {
      query.currentOwner = filters.owner;
    }
  }

  if (filters.location === "宜昌") {
    query.assetCode = { $in: YICHANG_DEVICE_CODES };
  }

  if (filters.location === "武汉") {
    query.assetCode = { $nin: YICHANG_DEVICE_CODES };
  }

  if (search) {
    query.$or = [
      { assetCode: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
      { model: { $regex: search, $options: "i" } },
      { currentOwner: { $regex: search, $options: "i" } },
    ];
  }

  if (andConditions.length) {
    query.$and = andConditions;
  }

  return query;
}
