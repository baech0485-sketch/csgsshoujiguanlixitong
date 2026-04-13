import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEVICE_LIST_PROJECTION,
  DEVICE_PAGE_INDEX_SPECS,
  DEVICE_PREVIEW_PROJECTION,
  getDevicePageDataFromCollection,
  resetDevicePageIndexesForTests,
} from "@/lib/device-page-data";

function createFindCursor(rows: Record<string, unknown>[]) {
  return {
    sort() {
      return {
        skip() {
          return {
            limit() {
              return {
                async toArray() {
                  return rows;
                },
              };
            },
          };
        },
      };
    },
  };
}

describe("getDevicePageDataFromCollection", () => {
  beforeEach(() => {
    resetDevicePageIndexesForTests();
  });

  it("设备列表查询不应拉取图片字段，并只为右侧速览单独查询选中设备", async () => {
    const listRows = [
      {
        assetCode: "sj-02",
        brand: "Apple",
        model: "iPhone 15",
        storage: "256G",
        currentOwner: "张三",
        status: "已分配",
        updatedAt: "2026-04-13T08:00:00.000Z",
      },
    ];
    const countDocuments = vi.fn(async () => 1);
    const createIndexes = vi.fn(async () => ["updatedAt_desc"]);
    const find = vi.fn(() => createFindCursor(listRows));
    const aggregate = vi.fn()
      .mockReturnValueOnce({
        async toArray() {
          return [{ _id: "张三" }];
        },
      })
      .mockReturnValueOnce({
        async toArray() {
          return [{ _id: "已分配", count: 1 }];
        },
      });
    const findOne = vi.fn(async () => ({
      ...listRows[0],
      photoDataUrl: "data:image/png;base64,preview",
    }));

    const result = await getDevicePageDataFromCollection(
      {
        countDocuments,
        createIndexes,
        find,
        aggregate,
        findOne,
      },
      {
        search: "",
        status: "",
        brand: "",
        owner: "",
      },
      1,
      "sj-02",
    );

    expect(find).toHaveBeenCalledWith({}, { projection: DEVICE_LIST_PROJECTION });
    expect(findOne).toHaveBeenCalledWith(
      { assetCode: "sj-02" },
      { projection: DEVICE_PREVIEW_PROJECTION },
    );
    expect(result.rows[0].photoDataUrl).toBeUndefined();
    expect(result.selectedRow?.photoDataUrl).toBe("data:image/png;base64,preview");
  });

  it("未指定选中设备时应自动为当前页首条设备加载速览，并补齐默认排序索引", async () => {
    const listRows = [
      {
        assetCode: "sj-09",
        brand: "Apple",
        model: "iPhone 16",
        storage: "512G",
        currentOwner: "",
        status: "待分配",
        updatedAt: "2026-04-13T09:00:00.000Z",
      },
      {
        assetCode: "sj-08",
        brand: "Apple",
        model: "iPhone 15",
        storage: "256G",
        currentOwner: "",
        status: "待分配",
        updatedAt: "2026-04-12T09:00:00.000Z",
      },
    ];
    const createIndexes = vi.fn(async () => ["updatedAt_desc", "currentOwner_updatedAt"]);
    const findOne = vi.fn(async () => ({
      ...listRows[0],
      photoDataUrl: "data:image/png;base64,default-preview",
    }));

    await getDevicePageDataFromCollection(
      {
        countDocuments: async () => 2,
        createIndexes,
        find: () => createFindCursor(listRows),
        aggregate: vi.fn()
          .mockReturnValueOnce({
            async toArray() {
              return [{ _id: "库存" }];
            },
          })
          .mockReturnValueOnce({
            async toArray() {
              return [{ _id: "待分配", count: 2 }];
            },
          }),
        findOne,
      },
      {
        search: "",
        status: "",
        brand: "",
        owner: "",
      },
      1,
      "",
    );

    expect(createIndexes).toHaveBeenCalledWith(DEVICE_PAGE_INDEX_SPECS);
    expect(findOne).toHaveBeenCalledWith(
      { assetCode: "sj-09" },
      { projection: DEVICE_PREVIEW_PROJECTION },
    );
  });
});
