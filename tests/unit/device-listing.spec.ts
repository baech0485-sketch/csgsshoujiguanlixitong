import { describe, expect, it } from "vitest";
import { applyDeviceFilters, buildDeviceMongoQuery, inferDeviceLocation } from "@/lib/device-listing";

const sampleRows = [
  { code: "sj-18", model: "iPhone 14 Pro / 256G", owner: "李明", status: "已分配", location: "宜昌", date: "2026-04-06 14:32", tone: "selected" as const },
  { code: "sj-11", model: "iPhone 13 / 128G", owner: "待确认", status: "已分配", location: "宜昌", date: "2026-04-06 11:18", tone: "warning" as const },
  { code: "sj-86", model: "Xiaomi 14 / 256G", owner: "库存", status: "待分配", location: "武汉", date: "2026-04-05 18:09", tone: "success" as const },
];

describe("inferDeviceLocation", () => {
  it("应按手机编号 1 到 48 推导宜昌，其余推导武汉", () => {
    expect(inferDeviceLocation("sj-1")).toBe("宜昌");
    expect(inferDeviceLocation("sj-48")).toBe("宜昌");
    expect(inferDeviceLocation("sj-49")).toBe("武汉");
    expect(inferDeviceLocation("sj-86")).toBe("武汉");
  });
});

describe("applyDeviceFilters", () => {
  it("应按搜索关键字过滤手机编号和型号", () => {
    const rows = applyDeviceFilters(sampleRows, { search: "11", status: "", brand: "", owner: "", location: "" });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.code).toBe("sj-11");
  });

  it("应按状态过滤结果", () => {
    const rows = applyDeviceFilters(sampleRows, { search: "", status: "待分配", brand: "", owner: "", location: "" });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("待分配");
  });

  it("应按所在地过滤结果", () => {
    const rows = applyDeviceFilters(sampleRows, { search: "", status: "", brand: "", owner: "", location: "武汉" });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.code).toBe("sj-86");
  });
});

describe("buildDeviceMongoQuery", () => {
  it("应生成状态、责任人和搜索关键字的数据库查询条件", () => {
    const query = buildDeviceMongoQuery({
      search: "sj-01",
      status: "待分配",
      brand: "",
      owner: "库存",
      location: "",
    });

    expect(query.status).toBe("待分配");
    expect(query.$or).toHaveLength(4);
    expect(query.$and).toBeDefined();
  });

  it("应把所在地筛选转换为手机编号范围查询", () => {
    const yichangCodes = Array.from({ length: 48 }, (_, index) => {
      const sequence = index + 1;
      return [`sj-${sequence}`, `sj-${String(sequence).padStart(2, "0")}`];
    }).flat();

    expect(buildDeviceMongoQuery({ search: "", status: "", brand: "", owner: "", location: "宜昌" }).assetCode).toEqual({
      $in: yichangCodes,
    });
    expect(buildDeviceMongoQuery({ search: "", status: "", brand: "", owner: "", location: "武汉" }).assetCode).toEqual({
      $nin: yichangCodes,
    });
  });
});
