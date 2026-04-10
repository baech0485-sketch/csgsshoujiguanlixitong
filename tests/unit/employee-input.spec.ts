import { describe, expect, it } from "vitest";
import { buildNextEmployeeCode, normalizeEmployeeInput } from "@/lib/employee-input";

describe("normalizeEmployeeInput", () => {
  it("应补齐默认状态与时间字段", () => {
    const result = normalizeEmployeeInput({
      employeeCode: "cs-01",
      name: "张晓雯",
      department: "武汉销售部",
      phone: "",
      title: "",
      status: "",
    });

    expect(result.employeeCode).toBe("cs-01");
    expect(result.name).toBe("张晓雯");
    expect(result.department).toBe("武汉销售部");
    expect(result.title).toBe("销售");
    expect(result.status).toBe("在职");
    expect(result.deviceCount).toBe(0);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it("缺少员工编号、姓名或部门时应抛出错误", () => {
    expect(() =>
      normalizeEmployeeInput({
        employeeCode: "cs-01",
        name: "",
        department: "",
        phone: "",
        title: "",
        status: "",
      }),
    ).toThrow("员工编号、姓名和部门为必填项");
  });

  it("员工状态非法时应抛出错误", () => {
    expect(() =>
      normalizeEmployeeInput({
        employeeCode: "cs-02",
        name: "李静",
        department: "宜昌销售部",
        phone: "",
        title: "",
        status: "试用",
      }),
    ).toThrow("员工状态仅支持在职或离职");
  });

  it("员工编号格式不符合 cs-01 时应抛出错误", () => {
    expect(() =>
      normalizeEmployeeInput({
        employeeCode: "cs-a1",
        name: "李静",
        department: "宜昌销售部",
        phone: "",
        title: "",
        status: "",
      }),
    ).toThrow("员工编号格式必须为 cs-01");
  });

  it("部门不在允许范围内时应抛出错误", () => {
    expect(() =>
      normalizeEmployeeInput({
        employeeCode: "cs-03",
        name: "王敏",
        department: "上海销售部",
        phone: "",
        title: "",
        status: "",
      }),
    ).toThrow("部门仅支持武汉销售部或宜昌销售部");
  });
});

describe("buildNextEmployeeCode", () => {
  it("应按现有最大编号顺序生成下一个员工编号", () => {
    expect(buildNextEmployeeCode([])).toBe("cs-01");
    expect(buildNextEmployeeCode(["cs-01", "cs-02", "cs-09"])).toBe("cs-10");
    expect(buildNextEmployeeCode(["cs-01", "EMP-001", "cs-15"])).toBe("cs-16");
  });
});
