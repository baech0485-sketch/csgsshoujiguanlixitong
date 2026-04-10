import { describe, expect, it } from "vitest";
import { normalizeEmployeePatch } from "@/lib/employee-patch";

describe("normalizeEmployeePatch", () => {
  it("应只规范允许更新的员工字段", () => {
    const result = normalizeEmployeePatch({
      name: "王媛",
      department: "武汉销售部",
      phone: "",
      title: "",
      status: "离职",
    });

    expect(result).toMatchObject({
      name: "王媛",
      department: "武汉销售部",
      phone: "",
      title: "销售",
      status: "离职",
    });
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it("姓名和部门不允许被更新为空", () => {
    expect(() =>
      normalizeEmployeePatch({
        name: "   ",
      }),
    ).toThrow("姓名不能为空");

    expect(() =>
      normalizeEmployeePatch({
        department: "   ",
      }),
    ).toThrow("部门不能为空");
  });

  it("状态仅支持在职或离职", () => {
    expect(() =>
      normalizeEmployeePatch({
        status: "禁用",
      }),
    ).toThrow("员工状态仅支持在职或离职");
  });

  it("部门仅支持固定的两个销售部门", () => {
    expect(() =>
      normalizeEmployeePatch({
        department: "上海销售部",
      }),
    ).toThrow("部门仅支持武汉销售部或宜昌销售部");
  });
});
