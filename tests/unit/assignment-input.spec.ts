import { describe, expect, it } from "vitest";
import { buildWorkflowUrl, createWorkflowToken } from "@/lib/workflow-links";
import { normalizeAssignmentInput } from "@/lib/assignment-input";

describe("normalizeAssignmentInput", () => {
  it("应校验分配必填项并生成默认时间字段", () => {
    const result = normalizeAssignmentInput({
      employeeCode: "cs-01",
      employeeName: "张晓雯",
      department: "销售一组",
      deviceCode: "sj-01",
      deviceTitle: "iPhone 15 · 256G",
    });

    expect(result.employeeCode).toBe("cs-01");
    expect(result.deviceCode).toBe("sj-01");
    expect(result.status).toBe("待领取");
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it("缺少员工编号或手机编号时应抛出错误", () => {
    expect(() =>
      normalizeAssignmentInput({
        employeeCode: "",
        employeeName: "",
        department: "",
        deviceCode: "",
        deviceTitle: "",
      }),
    ).toThrow("员工编号、员工姓名、部门和手机编号为必填项");
  });
});

describe("workflow-links", () => {
  it("应生成可用的随机 token", () => {
    const token = createWorkflowToken();
    expect(token.length).toBeGreaterThanOrEqual(20);
  });

  it("应拼出员工确认链接", () => {
    const url = buildWorkflowUrl("http://localhost:3000", "/m/receipt-confirm", "token-001");
    expect(url).toBe("http://localhost:3000/m/receipt-confirm?token=token-001");
  });
});
