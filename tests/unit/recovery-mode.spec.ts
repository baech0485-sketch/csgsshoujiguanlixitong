import { describe, expect, it } from "vitest";
import { getRecoveryModeMeta, normalizeRecoveryMode } from "@/lib/recovery-mode";

describe("recovery-mode", () => {
  it("未传模式时应默认按离职回收处理", () => {
    expect(normalizeRecoveryMode(undefined)).toBe("offboarding");
    expect(normalizeRecoveryMode("")).toBe("offboarding");
  });

  it("active 模式应映射为在职回收", () => {
    expect(normalizeRecoveryMode("active")).toBe("active");
    expect(getRecoveryModeMeta("active")).toMatchObject({
      label: "在职回收",
      createButtonLabel: "生成在职回收链接",
    });
  });

  it("offboarding 模式应保留离职回收文案", () => {
    expect(getRecoveryModeMeta("offboarding")).toMatchObject({
      label: "离职回收",
      createButtonLabel: "生成离职回收链接",
    });
  });
});
