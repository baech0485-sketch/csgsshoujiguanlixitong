type ExchangeCommand = {
  sourceEmployeeCode: string;
  targetEmployeeCode: string;
  sourceDeviceCodes: string[];
  targetDeviceCodes: string[];
};

type ExchangeEmployee = {
  employeeCode: string;
  name: string;
  department: string;
  status: string;
};

type ExchangeDevice = {
  assetCode: string;
  brand: string;
  model: string;
  storage: string;
  status: string;
  currentOwnerCode: string;
};

type ExchangeDeps = {
  findEmployeeByCode: (employeeCode: string) => Promise<ExchangeEmployee | null>;
  findDevicesByCodes: (deviceCodes: string[]) => Promise<ExchangeDevice[]>;
  hasPendingReceipt: (deviceCode: string) => Promise<boolean>;
  updateDeviceOwner: (deviceCode: string, patch: Record<string, unknown>) => Promise<unknown>;
  syncOpenWorkflows: (input: {
    sourceEmployeeCode: string;
    targetEmployeeCode: string;
    sourceEmployee: ExchangeEmployee;
    targetEmployee: ExchangeEmployee;
    sourceDeviceCodes: string[];
    targetDeviceCodes: string[];
    updatedAt: Date;
  }) => Promise<unknown>;
  logEvent: (record: {
    assetCode: string;
    type: string;
    title: string;
    actor: string;
    description?: string;
  }) => Promise<unknown>;
};

function normalizeCodes(deviceCodes: string[]) {
  return [...new Set(deviceCodes.map((code) => code.trim()).filter(Boolean))];
}

function buildDeviceTitle(device: Pick<ExchangeDevice, "brand" | "model" | "storage">) {
  return `${device.brand} ${device.model} · ${device.storage}`.trim();
}

async function resolveEmployee(employeeCode: string, deps: ExchangeDeps) {
  const employee = await deps.findEmployeeByCode(employeeCode);
  if (!employee) {
    throw new Error("员工不存在");
  }
  if (employee.status !== "在职") {
    throw new Error("仅支持在职员工之间交换手机");
  }
  return employee;
}

async function resolveOwnedDevices(
  ownerCode: string,
  deviceCodes: string[],
  deps: ExchangeDeps,
) {
  const normalizedCodes = normalizeCodes(deviceCodes);
  if (!normalizedCodes.length) {
    throw new Error("双方都至少需要选择一台手机");
  }

  const devices = await deps.findDevicesByCodes(normalizedCodes);
  if (devices.length !== normalizedCodes.length) {
    throw new Error("存在不存在的手机，无法完成交换");
  }

  for (const device of devices) {
    if (device.status !== "已分配" || device.currentOwnerCode !== ownerCode) {
      throw new Error("仅支持交换当前员工名下的已分配手机");
    }
    if (await deps.hasPendingReceipt(device.assetCode)) {
      throw new Error("存在待领取确认的手机，暂不允许交换");
    }
  }

  return devices;
}

async function applyOwnerPatch(
  devices: ExchangeDevice[],
  nextOwner: ExchangeEmployee,
  updatedAt: Date,
  deps: ExchangeDeps,
) {
  await Promise.all(devices.map((device) =>
    deps.updateDeviceOwner(device.assetCode, {
      currentOwnerCode: nextOwner.employeeCode,
      currentOwner: nextOwner.name,
      currentDepartment: nextOwner.department,
      status: "已分配",
      updatedAt,
    })
  ));
}

async function logExchangeEvents(
  devices: ExchangeDevice[],
  previousOwner: ExchangeEmployee,
  nextOwner: ExchangeEmployee,
  deps: ExchangeDeps,
) {
  await Promise.all(devices.map((device) =>
    deps.logEvent({
      assetCode: device.assetCode,
      type: "device_exchanged",
      title: `设备已交换给 ${nextOwner.name}`,
      actor: "资产管理员",
      description: `${buildDeviceTitle(device)} 从 ${previousOwner.name} 交换至 ${nextOwner.name}`,
    })
  ));
}

export async function executeDeviceExchange(command: ExchangeCommand, deps: ExchangeDeps) {
  const sourceEmployeeCode = command.sourceEmployeeCode.trim();
  const targetEmployeeCode = command.targetEmployeeCode.trim();

  if (!sourceEmployeeCode || !targetEmployeeCode) {
    throw new Error("请选择两名员工");
  }
  if (sourceEmployeeCode === targetEmployeeCode) {
    throw new Error("不能选择同一名员工进行交换");
  }

  const [sourceEmployee, targetEmployee] = await Promise.all([
    resolveEmployee(sourceEmployeeCode, deps),
    resolveEmployee(targetEmployeeCode, deps),
  ]);
  const [sourceDevices, targetDevices] = await Promise.all([
    resolveOwnedDevices(sourceEmployeeCode, command.sourceDeviceCodes, deps),
    resolveOwnedDevices(targetEmployeeCode, command.targetDeviceCodes, deps),
  ]);
  const updatedAt = new Date();

  await applyOwnerPatch(sourceDevices, targetEmployee, updatedAt, deps);
  await applyOwnerPatch(targetDevices, sourceEmployee, updatedAt, deps);
  await deps.syncOpenWorkflows({
    sourceEmployeeCode,
    targetEmployeeCode,
    sourceEmployee,
    targetEmployee,
    sourceDeviceCodes: sourceDevices.map((device) => device.assetCode),
    targetDeviceCodes: targetDevices.map((device) => device.assetCode),
    updatedAt,
  });
  await Promise.all([
    logExchangeEvents(sourceDevices, sourceEmployee, targetEmployee, deps),
    logExchangeEvents(targetDevices, targetEmployee, sourceEmployee, deps),
  ]);

  return {
    sourceEmployeeCode,
    targetEmployeeCode,
    sourceDeviceCodes: sourceDevices.map((device) => device.assetCode),
    targetDeviceCodes: targetDevices.map((device) => device.assetCode),
    totalDevices: sourceDevices.length + targetDevices.length,
  };
}
