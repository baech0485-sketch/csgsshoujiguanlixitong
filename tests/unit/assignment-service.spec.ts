import { describe, expect, it, vi } from "vitest";
import { executeAssignment, executeAssignments } from "@/lib/assignment-service";

describe("executeAssignment", () => {
  it("应只允许给在职员工分配待分配设备，并生成确认链接", async () => {
    const updateDevice = vi.fn(async () => ({ ok: true }));
    const createApproval = vi.fn(async () => ({ id: "approval-001" }));
    const logEvent = vi.fn(async () => undefined);

    const result = await executeAssignment(
      { employeeCode: "cs-01", deviceCode: "sj-01", baseUrl: "http://localhost:3000" },
      {
        findEmployeeByCode: async () => ({
          employeeCode: "cs-01",
          name: "张晓雯",
          department: "销售一组",
          status: "在职",
        }),
        findDeviceByCode: async () => ({
          assetCode: "sj-01",
          brand: "Apple",
          model: "iPhone 15",
          storage: "256G",
          status: "待分配",
        }),
        updateDevice,
        createApproval,
        logEvent,
      },
    );

    expect(result.confirmUrl).toMatch(/\/m\/receipt-confirm\?token=/);
    expect(result.status).toBe("待领取");
    expect(updateDevice).toHaveBeenCalledWith("sj-01", expect.objectContaining({ status: "已分配" }));
    expect(createApproval).toHaveBeenCalled();
    expect(logEvent).toHaveBeenCalled();
  });

  it("离职员工不允许被分配手机", async () => {
    await expect(() =>
      executeAssignment(
        { employeeCode: "cs-09", deviceCode: "sj-02", baseUrl: "http://localhost:3000" },
        {
          findEmployeeByCode: async () => ({
            employeeCode: "cs-09",
            name: "李静",
            department: "销售二组",
            status: "离职",
          }),
          findDeviceByCode: async () => ({
            assetCode: "sj-02",
            brand: "Apple",
            model: "iPhone 14",
            storage: "128G",
            status: "待分配",
          }),
          updateDevice: async () => ({ ok: true }),
          createApproval: async () => ({ id: "approval-002" }),
          logEvent: async () => undefined,
        },
      ),
    ).rejects.toThrow("离职员工无法分配手机");
  });

  it("非待分配设备不允许再次分配", async () => {
    await expect(() =>
      executeAssignment(
        { employeeCode: "cs-01", deviceCode: "sj-03", baseUrl: "http://localhost:3000" },
        {
          findEmployeeByCode: async () => ({
            employeeCode: "cs-01",
            name: "张晓雯",
            department: "销售一组",
            status: "在职",
          }),
          findDeviceByCode: async () => ({
            assetCode: "sj-03",
            brand: "Apple",
            model: "iPhone 13",
            storage: "128G",
            status: "已分配",
          }),
          updateDevice: async () => ({ ok: true }),
          createApproval: async () => ({ id: "approval-003" }),
          logEvent: async () => undefined,
        },
      ),
    ).rejects.toThrow("当前设备状态不允许再次分配");
  });

  it("应支持同一员工一次分配多台待分配手机", async () => {
    const updateDevice = vi.fn(async () => ({ ok: true }));
    const createApproval = vi.fn(async () => ({ id: `approval-${createApproval.mock.calls.length + 1}` }));
    const logEvent = vi.fn(async () => undefined);

    const result = await executeAssignments(
      { employeeCode: "cs-01", deviceCodes: ["sj-01", "sj-02"], baseUrl: "http://localhost:3000" },
      {
        findEmployeeByCode: async () => ({
          employeeCode: "cs-01",
          name: "张晓雯",
          department: "销售一组",
          status: "在职",
        }),
        findDeviceByCode: async (deviceCode) => ({
          assetCode: deviceCode,
          brand: "Apple",
          model: deviceCode === "sj-01" ? "iPhone 15" : "iPhone 14 Pro",
          storage: "256G",
          status: "待分配",
        }),
        updateDevice,
        createApproval,
        logEvent,
      },
    );

    expect(result.records).toHaveLength(1);
    expect(result.records[0].deviceCodes).toEqual(["sj-01", "sj-02"]);
    expect(result.records[0].devices).toEqual([
      expect.objectContaining({ deviceCode: "sj-01", location: "宜昌" }),
      expect.objectContaining({ deviceCode: "sj-02", location: "宜昌" }),
    ]);
    expect(createApproval).toHaveBeenCalledWith(expect.objectContaining({
      devices: [
        expect.objectContaining({ deviceCode: "sj-01", location: "宜昌" }),
        expect.objectContaining({ deviceCode: "sj-02", location: "宜昌" }),
      ],
    }));
    expect(createApproval).toHaveBeenCalledTimes(1);
    expect(updateDevice).toHaveBeenCalledTimes(2);
    expect(logEvent).toHaveBeenCalledTimes(2);
  });
});
