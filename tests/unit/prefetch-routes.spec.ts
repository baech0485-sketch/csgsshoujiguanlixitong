import { describe, expect, it } from "vitest";
import { getDesktopPrefetchRoutes } from "@/lib/prefetch-routes";

describe("prefetch-routes", () => {
  it("应返回除当前页外的桌面端主分页路由", () => {
    expect(getDesktopPrefetchRoutes("/dashboard")).toEqual([
      "/devices",
      "/employees",
      "/assignments",
      "/offboarding",
      "/incidents",
    ]);
  });
});
