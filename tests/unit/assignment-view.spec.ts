import { describe, expect, it, vi } from "vitest";
import { getAssignmentWorkspaceView } from "@/lib/assignment-view";

const employeeRows = [
  {
    employeeCode: "cs-01",
    name: "张三",
    department: "武汉销售部",
  },
];
const deviceRows = [
  {
    assetCode: "sj-12",
    brand: "Apple",
    model: "iPhone 15",
    storage: "256G",
    status: "待分配",
  },
  {
    assetCode: "sj-88",
    brand: "Apple",
    model: "iPhone 14",
    storage: "128G",
    status: "待分配",
  },
];

function createCursor<T>(rows: T[]) {
  return {
    sort: vi.fn(() => ({
      limit: vi.fn(() => ({
        toArray: vi.fn(async () => rows),
      })),
    })),
  };
}

vi.mock("@/lib/mongodb", () => ({
  getEmployeesCollection: async () => ({
    find: vi.fn(() => createCursor(employeeRows)),
  }),
  getDevicesCollection: async () => ({
    find: vi.fn(() => createCursor(deviceRows)),
  }),
}));

describe("getAssignmentWorkspaceView", () => {
  it("待分配手机选项应包含按编号推导的所在地", async () => {
    const view = await getAssignmentWorkspaceView();

    expect(view.devices).toEqual([
      expect.objectContaining({ deviceCode: "sj-12", location: "武汉" }),
      expect.objectContaining({ deviceCode: "sj-88", location: "武汉" }),
    ]);
  });
});
