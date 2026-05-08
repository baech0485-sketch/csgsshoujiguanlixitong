import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

test("手机完整详情页应支持修改设备图片", async ({ page }) => {
  await loginAsAdmin(page);
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });

  await page.goto("/devices?modal=new");
  const uniqueCode = await page.getByLabel("手机编号").inputValue();
  await page.getByRole("textbox", { name: "品牌" }).fill("Apple");
  await page.getByRole("textbox", { name: "型号" }).fill("iPhone Photo Edit");
  await page.getByRole("textbox", { name: "存储容量" }).fill("256G");
  await page.getByRole("textbox", { name: "序列号" }).fill(`SN-${Date.now()}`);
  await page.getByLabel("上传手机图片").setInputFiles({
    name: "phone.png",
    mimeType: "image/png",
    buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+cC1UAAAAASUVORK5CYII=", "base64"),
  });
  await page.getByRole("button", { name: "提交录入" }).click();
  await page.waitForURL(/\/devices\?selected=sj-\d{2,}$/);

  await page.goto(`/devices/${uniqueCode}`);
  const originalSrc = await page.getByAltText("设备图片").getAttribute("src");
  await expect(page.getByLabel("上传手机图片")).toBeVisible();
  await page.getByLabel("上传手机图片").setInputFiles({
    name: "phone-new.png",
    mimeType: "image/png",
    buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVR42mP8z8BQDwAFgwJ/lR2nZwAAAABJRU5ErkJggg==", "base64"),
  });
  await expect(page.getByText("压缩完成，可上传到云数据库")).toBeVisible();
  await expect(page.getByAltText("设备图片")).not.toHaveAttribute("src", originalSrc || "");

  const updateResponsePromise = page.waitForResponse((response) => response.url().includes(`/api/devices/${uniqueCode}`) && response.request().method() === "PATCH" && response.ok());
  await page.getByRole("button", { name: "保存修改" }).click();
  const updateRequestBody = JSON.parse((await updateResponsePromise).request().postData() || "{}") as { photoDataUrl?: string };
  expect(updateRequestBody.photoDataUrl).toMatch(/^data:image\/jpeg;base64,/);
});
