import { describe, expect, it } from "vitest";
import { normalizeDevicePatch } from "@/lib/device-input";

describe("normalizeDevicePatch", () => {
  it("应仅更新传入字段并刷新更新时间", () => {
    const result = normalizeDevicePatch({
      brand: "Apple",
      purchasePrice: "7999",
      status: "已分配",
    });

    expect(result).toMatchObject({
      brand: "Apple",
      purchasePrice: 7999,
      status: "已分配",
    });
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it("采购金额不是数字时应抛出错误", () => {
    expect(() =>
      normalizeDevicePatch({
        purchasePrice: "abc",
      }),
    ).toThrow("采购金额必须为数字");
  });

  it("设备状态仅允许待分配、已分配、修理中", () => {
    expect(() =>
      normalizeDevicePatch({
        status: "在库",
      }),
    ).toThrow("设备状态仅支持待分配、已分配或修理中");
  });
});
