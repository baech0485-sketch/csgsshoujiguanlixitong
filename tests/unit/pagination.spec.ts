import { describe, expect, it } from "vitest";
import { normalizePageParam, paginateItems } from "@/lib/pagination";

describe("normalizePageParam", () => {
  it("应把非法页码归一化为第 1 页", () => {
    expect(normalizePageParam(undefined)).toBe(1);
    expect(normalizePageParam("")).toBe(1);
    expect(normalizePageParam("abc")).toBe(1);
    expect(normalizePageParam("-2")).toBe(1);
    expect(normalizePageParam("0")).toBe(1);
  });

  it("应返回合法正整数页码", () => {
    expect(normalizePageParam("1")).toBe(1);
    expect(normalizePageParam("3")).toBe(3);
  });
});

describe("paginateItems", () => {
  it("应按每页固定条数切片并返回分页信息", () => {
    const items = Array.from({ length: 23 }, (_, index) => index + 1);
    const result = paginateItems(items, 2, 10);

    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(3);
    expect(result.totalItems).toBe(23);
    expect(result.items).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(result.hasPrev).toBe(true);
    expect(result.hasNext).toBe(true);
  });

  it("页码超出范围时应回退到最后一页", () => {
    const items = Array.from({ length: 13 }, (_, index) => index + 1);
    const result = paginateItems(items, 99, 10);

    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(2);
    expect(result.items).toEqual([11, 12, 13]);
  });
});
