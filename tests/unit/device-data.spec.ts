import { describe, expect, it } from "vitest";
import { resolveOptionalDeviceCode } from "@/lib/device-data";

describe("resolveOptionalDeviceCode", () => {
  it("成功时应返回生成的手机编号", async () => {
    await expect(resolveOptionalDeviceCode(async () => "sj-88")).resolves.toBe("sj-88");
  });

  it("生成编号失败时应回退为空字符串，避免页面直接崩溃", async () => {
    await expect(resolveOptionalDeviceCode(async () => {
      throw new Error("db offline");
    })).resolves.toBe("");
  });
});
