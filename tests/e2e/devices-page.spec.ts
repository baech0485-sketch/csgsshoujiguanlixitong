import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

test("手机资产台账页应支持通过查询参数联动列表和右侧详情", async ({ page }) => {
  await loginAsAdmin(page);
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });

  await page.goto("/devices?modal=new");
  const uniqueCode = await page.getByLabel("手机编号").inputValue();
  await expect(page.getByLabel("手机编号")).toHaveValue(/sj-\d{2,}/);
  await page.getByRole("textbox", { name: "品牌" }).fill("Apple");
  await page.getByRole("textbox", { name: "型号" }).fill("iPhone 13");
  await page.getByRole("textbox", { name: "存储容量" }).fill("128G");
  await page.getByRole("textbox", { name: "序列号" }).fill(`SN-${Date.now()}`);
  await page.getByLabel("上传手机图片").setInputFiles({
    name: "phone.png",
    mimeType: "image/png",
    buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+cC1UAAAAASUVORK5CYII=", "base64"),
  });
  await expect(page.getByLabel("入库日期")).toHaveValue(/\d{4}-\d{2}-\d{2}/);
  await expect(page.getByLabel("当前状态")).toHaveValue("待分配");
  await page.getByRole("button", { name: "提交录入" }).click();
  await page.waitForURL(/\/devices\?selected=sj-\d{2,}$/);

  await page.goto(`/devices?search=${uniqueCode}&selected=${uniqueCode}`);

  await expect(page.getByRole("link", { name: new RegExp(uniqueCode, "i") })).toBeVisible();
  await expect(page.getByText(`手机编号：${uniqueCode}`)).toBeVisible();
  await expect(page.getByText("当前状态：待分配")).toBeVisible();
  await expect(page.getByRole("link", { name: "查看完整详情" })).toHaveAttribute("href", new RegExp(uniqueCode));
});

test("手机资产页筛选区应自动应用搜索和筛选且不显示品牌筛选", async ({ page }) => {
  await loginAsAdmin(page);
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });

  await page.goto("/devices?modal=new");
  const uniqueCode = await page.getByLabel("手机编号").inputValue();
  await page.getByRole("textbox", { name: "品牌" }).fill("Apple");
  await page.getByRole("textbox", { name: "型号" }).fill("iPhone Auto Filter");
  await page.getByRole("textbox", { name: "存储容量" }).fill("128G");
  await page.getByRole("textbox", { name: "序列号" }).fill(`SN-${Date.now()}`);
  await page.getByLabel("上传手机图片").setInputFiles({
    name: "phone.png",
    mimeType: "image/png",
    buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+cC1UAAAAASUVORK5CYII=", "base64"),
  });
  await page.getByRole("button", { name: "提交录入" }).click();
  await page.waitForURL(/\/devices\?selected=sj-\d{2,}$/);

  await page.goto("/devices");
  await expect(page.getByText("品牌", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "应用筛选" })).toHaveCount(0);

  const searchBoxWidth = await page.locator(".filter-search__box").evaluate((node) => Number.parseFloat(window.getComputedStyle(node).width));
  expect(searchBoxWidth).toBeLessThanOrEqual(340);

  await page.getByLabel("状态").selectOption("待分配");
  await page.waitForURL(/status=%E5%BE%85%E5%88%86%E9%85%8D/, { timeout: 15000 });

  await page.getByPlaceholder("搜索 IMEI / 手机编号 / 责任人").fill(uniqueCode);
  await page.waitForURL(new RegExp(`search=${encodeURIComponent(uniqueCode)}`), { timeout: 15000 });
  await expect(page.getByRole("link", { name: new RegExp(uniqueCode, "i") })).toBeVisible();
});

test("录入手机应支持上传压缩后的设备图片并在详情页展示", async ({ page }) => {
  await loginAsAdmin(page);
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });

  await page.goto("/devices?modal=new");
  const uniqueCode = await page.getByLabel("手机编号").inputValue();
  await page.getByRole("textbox", { name: "品牌" }).fill("Apple");
  await page.getByRole("textbox", { name: "型号" }).fill("iPhone 15 Pro");
  await page.getByRole("textbox", { name: "存储容量" }).fill("256G");
  await page.getByRole("textbox", { name: "序列号" }).fill(`SN-${Date.now()}`);
  await page.getByLabel("上传手机图片").setInputFiles({
    name: "phone.png",
    mimeType: "image/png",
    buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+cC1UAAAAASUVORK5CYII=", "base64"),
  });

  await expect(page.getByText("压缩完成，可上传到云数据库")).toBeVisible();
  await expect(page.getByAltText("手机图片预览")).toBeVisible();
  await page.getByRole("button", { name: "提交录入" }).click();
  await page.waitForURL(/\/devices\?selected=sj-\d{2,}$/);

  await page.goto(`/devices/${uniqueCode}`);
  await expect(page.getByAltText("设备图片")).toBeVisible();
});

test("手机资产页应支持复制手机录入链接并在手机端打开录入页", async ({ page }) => {
  await loginAsAdmin(page);
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });

  await page.goto("/devices?modal=new");
  await page.getByRole("textbox", { name: "品牌" }).fill("Apple");
  await page.getByRole("textbox", { name: "型号" }).fill("iPhone Showcase");
  await page.getByRole("textbox", { name: "存储容量" }).fill("256G");
  await page.getByRole("textbox", { name: "序列号" }).fill(`SN-${Date.now()}`);
  await page.getByLabel("上传手机图片").setInputFiles({
    name: "phone.png",
    mimeType: "image/png",
    buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+cC1UAAAAASUVORK5CYII=", "base64"),
  });
  await page.getByRole("button", { name: "提交录入" }).click();
  await page.waitForURL(/\/devices\?selected=sj-\d{2,}$/);

  const copyButton = page.getByRole("button", { name: "复制手机录入链接" }).first();
  await expect(copyButton).toBeVisible();
  const href = await copyButton.getAttribute("data-link-value");
  expect(href).toContain("/m/device-entry");
  await copyButton.click();
  await expect(copyButton).toHaveText("已复制");

  await page.goto(String(href));
  await expect(page.getByRole("heading", { name: "手机录入", exact: true })).toBeVisible();
  await expect(page.getByLabel("品牌")).toBeVisible();
  await expect(page.getByLabel("上传手机图片")).toBeVisible();
});

test("手机录入弹窗应清晰区分自动生成、必填、选填并使用卡片式上传框", async ({ page }) => {
  await loginAsAdmin(page);
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });

  await page.goto("/devices?modal=new");
  await expect(page.getByText("自动生成", { exact: true })).toHaveCount(3);
  await expect(page.getByText("必填", { exact: true })).toHaveCount(5);
  await expect(page.getByText("选填", { exact: true })).toHaveCount(0);
  await expect(page.getByText("拖拽图片到此处，或点击选择文件")).toBeVisible();
});

test("手机资产列表点击设备后不应闪出登录状态验证遮罩", async ({ page }) => {
  await loginAsAdmin(page);
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });

  await page.goto("/devices?modal=new");
  const uniqueCode = await page.getByLabel("手机编号").inputValue();
  await page.getByRole("textbox", { name: "品牌" }).fill("Apple");
  await page.getByRole("textbox", { name: "型号" }).fill("iPhone Detail Jump");
  await page.getByRole("textbox", { name: "存储容量" }).fill("128G");
  await page.getByRole("textbox", { name: "序列号" }).fill(`SN-${Date.now()}`);
  await page.getByLabel("上传手机图片").setInputFiles({
    name: "phone.png",
    mimeType: "image/png",
    buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+cC1UAAAAASUVORK5CYII=", "base64"),
  });
  await page.getByRole("button", { name: "提交录入" }).click();
  await page.waitForURL(/\/devices\?selected=sj-\d{2,}$/);

  await page.goto(`/devices?search=${uniqueCode}`);
  const rowLink = page.getByRole("link", { name: new RegExp(uniqueCode, "i") }).first();
  await rowLink.click();
  await page.waitForURL(new RegExp(`selected=${encodeURIComponent(uniqueCode)}`));
  await expect(page.getByText("正在验证登录状态")).toHaveCount(0);
  await page.getByRole("link", { name: "查看完整详情" }).click();
  await page.waitForURL(new RegExp(`/devices/${uniqueCode}$`));
  await expect(page.getByText("正在验证登录状态")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "设备详情与编辑", exact: true })).toBeVisible();
});
