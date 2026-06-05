import { describe, expect, it } from "vitest";
import {
  buildOwnerDeviceMetrics,
  buildStatusCountMap,
} from "@/lib/device-ownership";

describe("device-ownership", () => {
  it("应按员工编号汇总已分配和维修中的设备数量", () => {
    const metrics = buildOwnerDeviceMetrics([
      { assetCode: "sj-01", currentOwnerCode: "cs-01", status: "已分配" },
      { assetCode: "sj-02", currentOwnerCode: "cs-01", status: "修理中" },
      { assetCode: "sj-03", currentOwnerCode: "cs-02", status: "已分配" },
      { assetCode: "sj-04", currentOwnerCode: "", status: "待分配" },
    ]);

    expect(metrics.get("cs-01")).toMatchObject({
      assignedCount: 1,
      repairingCount: 1,
    });
    expect(metrics.get("cs-02")).toMatchObject({
      assignedCount: 1,
      repairingCount: 0,
    });
    expect(metrics.get("cs-01")?.devices).toEqual([
      expect.objectContaining({ deviceCode: "sj-01", location: "宜昌" }),
      expect.objectContaining({ deviceCode: "sj-02", location: "宜昌" }),
    ]);
    expect(metrics.has("")).toBe(false);
  });

  it("应构建设备状态计数字典", () => {
    const counts = buildStatusCountMap([
      { _id: "待分配", count: 3 },
      { _id: "已分配", count: 2 },
      { _id: "修理中", count: 1 },
    ]);

    expect(counts["待分配"]).toBe(3);
    expect(counts["已分配"]).toBe(2);
    expect(counts["修理中"]).toBe(1);
    expect(counts["不存在"] ?? 0).toBe(0);
  });
});
