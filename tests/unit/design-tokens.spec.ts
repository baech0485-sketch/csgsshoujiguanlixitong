import { describe, expect, it } from "vitest";
import { colorTokens } from "@/lib/tokens";

describe("design tokens", () => {
  it("应暴露 Figma 的主色令牌", () => {
    expect(colorTokens.primarySurface).toBe("#103c43");
  });
});
