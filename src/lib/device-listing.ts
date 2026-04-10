export type DeviceListRow = {
  code: string;
  model: string;
  owner: string;
  status: string;
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
};

function normalized(value: string) {
  return value.trim().toLowerCase();
}

export function inferBrand(model: string) {
  return model.split(" ")[0] || "";
}

export function applyDeviceFilters(rows: DeviceListRow[], filters: DeviceFilters) {
  const search = normalized(filters.search);
  const status = normalized(filters.status);
  const brand = normalized(filters.brand);
  const owner = normalized(filters.owner);

  return rows.filter((row) => {
    const rowBrand = normalized(row.brand || inferBrand(row.model));
    const matchesSearch = !search || normalized(row.code).includes(search) || normalized(row.model).includes(search) || normalized(row.owner).includes(search);
    const matchesStatus = !status || normalized(row.status) === status;
    const matchesBrand = !brand || rowBrand === brand;
    const matchesOwner = !owner || normalized(row.owner) === owner;

    return matchesSearch && matchesStatus && matchesBrand && matchesOwner;
  });
}
