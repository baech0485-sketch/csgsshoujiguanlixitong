import { describe, expect, it } from "vitest";
import { formatBeijingDateTime } from "@/lib/date-time";

describe("date-time", () => {
  it("应将 UTC 时间格式化为北京时间", () => {
    expect(formatBeijingDateTime("2026-04-11T00:30:00.000Z")).toBe("2026-04-11 08:30");
  });

  it("缺少时间时应返回空字符串", () => {
    expect(formatBeijingDateTime("")).toBe("");
  });
});
