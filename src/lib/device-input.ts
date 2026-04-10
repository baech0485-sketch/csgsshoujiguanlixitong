export type DeviceFormInput = {
  assetCode: string;
  brand: string;
  model: string;
  storage: string;
  photoDataUrl?: string;
  imei1?: string;
  imei2?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchasePrice?: string;
  status?: string;
};

export type DeviceRecord = {
  assetCode: string;
  brand: string;
  model: string;
  storage: string;
  photoDataUrl: string | null;
  imei1: string | null;
  imei2: string | null;
  serialNumber: string | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type DevicePatchInput = Partial<DeviceFormInput>;

export type DevicePatchRecord = Partial<Omit<DeviceRecord, "createdAt">> & {
  updatedAt: Date;
};

const DEVICE_STATUSES = ["待分配", "已分配", "修理中"] as const;

function clean(value: string | undefined) {
  return (value || "").trim();
}

function normalizeAssetCode(value: string) {
  const assetCode = clean(value).toLowerCase();
  if (!/^sj-\d{2,}$/.test(assetCode)) {
    throw new Error("手机编号格式必须为 sj-01");
  }
  return assetCode;
}

export function buildNextDeviceCode(existingCodes: string[]) {
  let max = 0;
  for (const rawCode of existingCodes) {
    const match = clean(rawCode).toLowerCase().match(/^sj-(\d+)$/);
    if (!match) continue;
    max = Math.max(max, Number.parseInt(match[1], 10));
  }
  return `sj-${String(max + 1).padStart(2, "0")}`;
}

function normalizeDeviceStatus(value: string | undefined) {
  const status = clean(value);
  if (!status) {
    return "待分配";
  }
  if (!DEVICE_STATUSES.includes(status as (typeof DEVICE_STATUSES)[number])) {
    throw new Error("设备状态仅支持待分配、已分配或修理中");
  }
  return status;
}

function normalizePhotoDataUrl(value: string | undefined) {
  const photoDataUrl = clean(value);
  if (!photoDataUrl) {
    return null;
  }
  if (!photoDataUrl.startsWith("data:image/")) {
    throw new Error("设备图片格式不正确");
  }
  return photoDataUrl;
}

export function normalizeDeviceInput(input: DeviceFormInput): DeviceRecord {
  const assetCode = normalizeAssetCode(input.assetCode);
  const brand = clean(input.brand);
  const model = clean(input.model);
  const storage = clean(input.storage);
  const serialNumber = clean(input.serialNumber);
  const imei1 = clean(input.imei1);
  const photoDataUrl = normalizePhotoDataUrl(input.photoDataUrl);

  if (!assetCode || !brand || !model || !storage || !serialNumber || !photoDataUrl) {
    throw new Error("手机编号、品牌、型号、容量、序列号和手机图片为必填项");
  }

  const now = new Date();
  const purchasePriceText = clean(input.purchasePrice);
  const purchasePrice = purchasePriceText ? Number(purchasePriceText) : null;

  if (purchasePriceText && Number.isNaN(purchasePrice)) {
    throw new Error("采购金额必须为数字");
  }

  return {
    assetCode,
    brand,
    model,
    storage,
    photoDataUrl,
    imei1: imei1 || null,
    imei2: clean(input.imei2) || null,
    serialNumber,
    purchaseDate: clean(input.purchaseDate) || now.toISOString().slice(0, 10),
    purchasePrice,
    status: normalizeDeviceStatus(input.status),
    createdAt: now,
    updatedAt: now,
  };
}

export function normalizeDevicePatch(input: DevicePatchInput): DevicePatchRecord {
  const purchasePriceText = input.purchasePrice ? clean(input.purchasePrice) : "";
  const purchasePrice = purchasePriceText ? Number(purchasePriceText) : undefined;

  if (purchasePriceText && Number.isNaN(purchasePrice)) {
    throw new Error("采购金额必须为数字");
  }

  return {
    ...(input.assetCode ? { assetCode: normalizeAssetCode(input.assetCode) } : {}),
    ...(input.brand ? { brand: clean(input.brand) } : {}),
    ...(input.model ? { model: clean(input.model) } : {}),
    ...(input.storage ? { storage: clean(input.storage) } : {}),
    ...(input.photoDataUrl !== undefined ? { photoDataUrl: normalizePhotoDataUrl(input.photoDataUrl) } : {}),
    ...(input.imei1 ? { imei1: clean(input.imei1) } : {}),
    ...(input.imei2 !== undefined ? { imei2: clean(input.imei2) || null } : {}),
    ...(input.serialNumber !== undefined ? { serialNumber: clean(input.serialNumber) || null } : {}),
    ...(input.purchaseDate !== undefined ? { purchaseDate: clean(input.purchaseDate) || null } : {}),
    ...(purchasePrice !== undefined ? { purchasePrice } : {}),
    ...(input.status !== undefined ? { status: normalizeDeviceStatus(input.status) } : {}),
    updatedAt: new Date(),
  };
}
