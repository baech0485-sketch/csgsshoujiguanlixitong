import { describe, expect, it, vi } from "vitest";
import { executeDeviceExchange } from "@/lib/device-exchange-service";

describe("executeDeviceExchange", () => {
  it("应支持在两名在职员工之间交换已分配手机并记录事件", async () => {
    const updateDeviceOwner = vi.fn(async () => ({ ok: true }));
    const logEvent = vi.fn(async () => undefined);
    const syncOpenWorkflows = vi.fn(async () => undefined);

    const result = await executeDeviceExchange(
      {
        sourceEmployeeCode: "cs-01",
        targetEmployeeCode: "cs-02",
        sourceDeviceCodes: ["sj-01"],
        targetDeviceCodes: ["sj-02", "sj-03"],
      },
      {
        findEmployeeByCode: async (employeeCode) => ({
          employeeCode,
          name: employeeCode === "cs-01" ? "张晓雯" : "李静",
          department: employeeCode === "cs-01" ? "武汉销售部" : "宜昌销售部",
          status: "在职",
        }),
        findDevicesByCodes: async (deviceCodes) => deviceCodes.map((deviceCode) => ({
          assetCode: deviceCode,
          brand: "Apple",
          model: deviceCode === "sj-01" ? "iPhone 15" : "iPhone 14",
          storage: "256G",
          status: "已分配",
          currentOwnerCode: deviceCode === "sj-01" ? "cs-01" : "cs-02",
        })),
        hasPendingReceipt: async () => false,
        updateDeviceOwner,
        syncOpenWorkflows,
        logEvent,
      },
    );

    expect(result.totalDevices).toBe(3);
    expect(result.sourceDeviceCodes).toEqual(["sj-01"]);
    expect(result.targetDeviceCodes).toEqual(["sj-02", "sj-03"]);
    expect(updateDeviceOwner).toHaveBeenCalledTimes(3);
    expect(updateDeviceOwner).toHaveBeenCalledWith("sj-01", expect.objectContaining({
      currentOwnerCode: "cs-02",
      currentOwner: "李静",
      currentDepartment: "宜昌销售部",
      status: "已分配",
    }));
    expect(updateDeviceOwner).toHaveBeenCalledWith("sj-02", expect.objectContaining({
      currentOwnerCode: "cs-01",
      currentOwner: "张晓雯",
      currentDepartment: "武汉销售部",
    }));
    expect(syncOpenWorkflows).toHaveBeenCalledWith(expect.objectContaining({
      sourceEmployeeCode: "cs-01",
      targetEmployeeCode: "cs-02",
      sourceDeviceCodes: ["sj-01"],
      targetDeviceCodes: ["sj-02", "sj-03"],
    }));
    expect(logEvent).toHaveBeenCalledTimes(3);
  });

  it("待领取确认的手机不允许直接交换", async () => {
    await expect(() =>
      executeDeviceExchange(
        {
          sourceEmployeeCode: "cs-01",
          targetEmployeeCode: "cs-02",
          sourceDeviceCodes: ["sj-01"],
          targetDeviceCodes: ["sj-02"],
        },
        {
          findEmployeeByCode: async (employeeCode) => ({
            employeeCode,
            name: employeeCode === "cs-01" ? "张晓雯" : "李静",
            department: "武汉销售部",
            status: "在职",
          }),
          findDevicesByCodes: async (deviceCodes) => deviceCodes.map((deviceCode) => ({
            assetCode: deviceCode,
            brand: "Apple",
            model: `iPhone ${deviceCode}`,
            storage: "128G",
            status: "已分配",
            currentOwnerCode: deviceCode === "sj-01" ? "cs-01" : "cs-02",
          })),
          hasPendingReceipt: async (deviceCode) => deviceCode === "sj-01",
          updateDeviceOwner: async () => ({ ok: true }),
          syncOpenWorkflows: async () => undefined,
          logEvent: async () => undefined,
        },
      ),
    ).rejects.toThrow("存在待领取确认的手机，暂不允许交换");
  });

  it("只能交换当前员工名下的已分配手机", async () => {
    await expect(() =>
      executeDeviceExchange(
        {
          mode: "bidirectional",
          sourceEmployeeCode: "cs-01",
          targetEmployeeCode: "cs-02",
          sourceDeviceCodes: ["sj-01"],
          targetDeviceCodes: ["sj-02"],
        },
        {
          findEmployeeByCode: async (employeeCode) => ({
            employeeCode,
            name: employeeCode === "cs-01" ? "张晓雯" : "李静",
            department: "武汉销售部",
            status: "在职",
          }),
          findDevicesByCodes: async (deviceCodes) => deviceCodes.map((deviceCode) => (
            deviceCode === "sj-01"
              ? {
                  assetCode: "sj-01",
                  brand: "Apple",
                  model: "iPhone 15",
                  storage: "256G",
                  status: "修理中",
                  currentOwnerCode: "cs-01",
                }
              : {
                  assetCode: "sj-02",
                  brand: "Apple",
                  model: "iPhone 14",
                  storage: "256G",
                  status: "已分配",
                  currentOwnerCode: "cs-02",
                }
          )),
          hasPendingReceipt: async () => false,
          updateDeviceOwner: async () => ({ ok: true }),
          syncOpenWorkflows: async () => undefined,
          logEvent: async () => undefined,
        },
      ),
    ).rejects.toThrow("仅支持交换当前员工名下的已分配手机");
  });

  it("应支持单向交换，只把员工甲选中的手机转给员工乙", async () => {
    const updateDeviceOwner = vi.fn(async () => ({ ok: true }));
    const logEvent = vi.fn(async () => undefined);
    const syncOpenWorkflows = vi.fn(async () => undefined);

    const result = await executeDeviceExchange(
      {
        mode: "unidirectional",
        sourceEmployeeCode: "cs-01",
        targetEmployeeCode: "cs-02",
        sourceDeviceCodes: ["sj-01", "sj-02"],
        targetDeviceCodes: [],
      },
      {
        findEmployeeByCode: async (employeeCode) => ({
          employeeCode,
          name: employeeCode === "cs-01" ? "张晓雯" : "李静",
          department: employeeCode === "cs-01" ? "武汉销售部" : "宜昌销售部",
          status: "在职",
        }),
        findDevicesByCodes: async (deviceCodes) => deviceCodes.map((deviceCode) => ({
          assetCode: deviceCode,
          brand: "Apple",
          model: "iPhone 15",
          storage: "256G",
          status: "已分配",
          currentOwnerCode: "cs-01",
        })),
        hasPendingReceipt: async () => false,
        updateDeviceOwner,
        syncOpenWorkflows,
        logEvent,
      },
    );

    expect(result.mode).toBe("unidirectional");
    expect(result.totalDevices).toBe(2);
    expect(result.targetDeviceCodes).toEqual([]);
    expect(updateDeviceOwner).toHaveBeenCalledTimes(2);
    expect(syncOpenWorkflows).toHaveBeenCalledWith(expect.objectContaining({
      sourceDeviceCodes: ["sj-01", "sj-02"],
      targetDeviceCodes: [],
    }));
    expect(logEvent).toHaveBeenCalledTimes(2);
  });
});
