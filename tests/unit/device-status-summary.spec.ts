import { describe, expect, it } from "vitest";
import { buildDeviceStatusCards } from "@/lib/device-status-summary";

describe("buildDeviceStatusCards", () => {
  it("应输出全部手机、待分配、已分配和修理中四张状态卡片", () => {
    const cards = buildDeviceStatusCards({
      total: 18,
      pending: 5,
      assigned: 11,
      repairing: 2,
    });

    expect(cards).toHaveLength(4);
    expect(cards.map((item) => item.label)).toEqual(["全部手机", "待分配", "已分配", "修理中"]);
    expect(cards.map((item) => item.value)).toEqual(["18", "05", "11", "02"]);
  });
});
