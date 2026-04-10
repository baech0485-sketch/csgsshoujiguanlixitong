import { describe, expect, it } from "vitest";
import { buildNextDeviceCode, normalizeDeviceInput } from "@/lib/device-input";

describe("normalizeDeviceInput", () => {
  it("应为手机录入补齐默认状态和时间字段", () => {
    const result = normalizeDeviceInput({
      assetCode: "sj-01",
      brand: "Apple",
      model: "iPhone 15",
      storage: "256G",
      imei1: "",
      imei2: "",
      serialNumber: "F2LXTEST001",
      photoDataUrl: "data:image/jpeg;base64,abc123",
      purchaseDate: "",
      purchasePrice: "",
      status: "",
    });

    expect(result.status).toBe("待分配");
    expect(result.purchasePrice).toBeNull();
    expect(result.purchaseDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result.imei1).toBeNull();
    expect(result.photoDataUrl).toBe("data:image/jpeg;base64,abc123");
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it("缺少必填字段时应抛出错误", () => {
    expect(() =>
      normalizeDeviceInput({
        assetCode: "sj-01",
        brand: "",
        model: "iPhone 15",
        storage: "256G",
        imei1: "",
        imei2: "",
        serialNumber: "",
        photoDataUrl: "",
        purchaseDate: "",
        purchasePrice: "",
        status: "",
      }),
    ).toThrow("手机编号、品牌、型号、容量、序列号和手机图片为必填项");
  });

  it("手机编号格式不符合 sj-01 时应抛出错误", () => {
    expect(() =>
      normalizeDeviceInput({
        assetCode: "sj-300a",
        brand: "Apple",
        model: "iPhone 15",
        storage: "256G",
        imei1: "869018820011234",
        imei2: "",
        serialNumber: "",
        photoDataUrl: "",
        purchaseDate: "",
        purchasePrice: "",
        status: "",
      }),
    ).toThrow("手机编号格式必须为 sj-01");
  });

  it("设备图片不是图片 data url 时应抛出错误", () => {
    expect(() =>
      normalizeDeviceInput({
        assetCode: "sj-01",
        brand: "Apple",
        model: "iPhone 15",
        storage: "256G",
        imei1: "",
        imei2: "",
        serialNumber: "",
        photoDataUrl: "data:text/plain;base64,abc123",
        purchaseDate: "",
        purchasePrice: "",
        status: "",
      }),
    ).toThrow("设备图片格式不正确");
  });

  it("缺少序列号或图片时应抛出错误", () => {
    expect(() =>
      normalizeDeviceInput({
        assetCode: "sj-01",
        brand: "Apple",
        model: "iPhone 15",
        storage: "256G",
        imei1: "",
        imei2: "",
        serialNumber: "",
        photoDataUrl: "data:image/jpeg;base64,abc123",
        purchaseDate: "",
        purchasePrice: "",
        status: "",
      }),
    ).toThrow("手机编号、品牌、型号、容量、序列号和手机图片为必填项");

    expect(() =>
      normalizeDeviceInput({
        assetCode: "sj-01",
        brand: "Apple",
        model: "iPhone 15",
        storage: "256G",
        imei1: "",
        imei2: "",
        serialNumber: "SN-001",
        photoDataUrl: "",
        purchaseDate: "",
        purchasePrice: "",
        status: "",
      }),
    ).toThrow("手机编号、品牌、型号、容量、序列号和手机图片为必填项");
  });
});

describe("buildNextDeviceCode", () => {
  it("应按现有最大编号顺序生成下一个手机编号", () => {
    expect(buildNextDeviceCode([])).toBe("sj-01");
    expect(buildNextDeviceCode(["sj-01", "sj-02", "sj-09"])).toBe("sj-10");
    expect(buildNextDeviceCode(["sj-01", "CSG-001", "sj-15"])).toBe("sj-16");
  });
});
