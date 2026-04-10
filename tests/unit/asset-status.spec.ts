import { describe, expect, it } from "vitest";
import { getAssetStatusMeta } from "@/lib/asset-status";

describe("getAssetStatusMeta", () => {
  it("应为三种手机资产状态返回不同的样式变体", () => {
    expect(getAssetStatusMeta("待分配")).toMatchObject({ variant: "pending", label: "待分配" });
    expect(getAssetStatusMeta("已分配")).toMatchObject({ variant: "assigned", label: "已分配" });
    expect(getAssetStatusMeta("修理中")).toMatchObject({ variant: "repair", label: "修理中" });
  });

  it("未知状态应回退到默认的待分配样式", () => {
    expect(getAssetStatusMeta("未知")).toMatchObject({ variant: "pending", label: "待分配" });
  });
});
