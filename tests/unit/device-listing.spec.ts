import { describe, expect, it } from "vitest";
import { applyDeviceFilters } from "@/lib/device-listing";

const sampleRows = [
  { code: "sj-18", model: "iPhone 14 Pro / 256G", owner: "李明", status: "已分配", date: "2026-04-06 14:32", tone: "selected" as const },
  { code: "sj-11", model: "iPhone 13 / 128G", owner: "待确认", status: "已分配", date: "2026-04-06 11:18", tone: "warning" as const },
  { code: "sj-86", model: "Xiaomi 14 / 256G", owner: "库存", status: "待分配", date: "2026-04-05 18:09", tone: "success" as const },
];

describe("applyDeviceFilters", () => {
  it("应按搜索关键字过滤手机编号和型号", () => {
    const rows = applyDeviceFilters(sampleRows, { search: "11", status: "", brand: "", owner: "" });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.code).toBe("sj-11");
  });

  it("应按状态过滤结果", () => {
    const rows = applyDeviceFilters(sampleRows, { search: "", status: "待分配", brand: "", owner: "" });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("待分配");
  });
});
