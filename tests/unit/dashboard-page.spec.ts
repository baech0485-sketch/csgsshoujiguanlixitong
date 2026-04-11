import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("dashboard page", () => {
  it("应强制动态渲染以实时读取云数据库统计", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src", "app", "dashboard", "page.tsx"),
      "utf8",
    );

    expect(source).toContain('export const dynamic = "force-dynamic"');
  });
});
