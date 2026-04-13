import { describe, expect, it } from "vitest";
import { canDeleteAssignmentApproval } from "@/lib/approval-record-lock";

describe("canDeleteAssignmentApproval", () => {
  it("待领取记录应允许删除", () => {
    expect(canDeleteAssignmentApproval("待领取")).toBe(true);
  });

  it("已领取记录应锁定删除", () => {
    expect(canDeleteAssignmentApproval("已领取")).toBe(false);
  });
});
