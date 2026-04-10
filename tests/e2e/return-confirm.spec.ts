import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

test("离职员工应可通过归还链接勾选确认并完成回收", async ({ page }) => {
  await loginAsAdmin(page);
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });

  const suffix = String(Date.now()).slice(-6);
  const employeeName = `归还测试员工${suffix}`;

  await page.goto("/employees");
  await page.getByLabel("姓名").fill(employeeName);
  await page.getByLabel("部门", { exact: true }).selectOption("武汉销售部");
  await page.getByRole("button", { name: "新增员工" }).click();
  const employeeCardSeed = page.getByRole("article").filter({ hasText: employeeName });
  const employeeCode = (await employeeCardSeed.locator("p").first().textContent())?.split("·")[0]?.trim() || "";

  await page.goto("/devices?modal=new");
  const deviceCode = await page.getByLabel("手机编号").inputValue();
  await page.getByRole("textbox", { name: "品牌" }).fill("Apple");
  await page.getByRole("textbox", { name: "型号" }).fill("iPhone 14 Pro");
  await page.getByRole("textbox", { name: "存储容量" }).fill("256G");
  await page.getByRole("textbox", { name: "序列号" }).fill(`SN-${Date.now()}`);
  await page.getByLabel("上传手机图片").setInputFiles({
    name: "phone.png",
    mimeType: "image/png",
    buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+cC1UAAAAASUVORK5CYII=", "base64"),
  });
  await page.getByRole("button", { name: "提交录入" }).click();
  await page.waitForURL(/\/devices\?selected=sj-\d{2,}$/);

  await page.goto("/assignments");
  await page.getByLabel("选择员工").selectOption(employeeCode);
  await page.getByLabel(`选择设备 ${deviceCode}`).check();
  await page.getByRole("button", { name: "提交分配" }).click();
  await expect(page.getByRole("article").filter({ hasText: employeeName }).first()).toBeVisible();

  await page.goto("/offboarding");
  await page.getByLabel("选择在职员工").selectOption(employeeCode);
  await page.getByRole("button", { name: "生成离职回收链接" }).click();

  const offboardingCard = page.getByRole("article").filter({ hasText: employeeName }).first();
  await expect(offboardingCard).toBeVisible();
  const href = await offboardingCard.getByRole("button", { name: /归还确认链接/i }).getAttribute("data-link-value");
  expect(href).toBeTruthy();

  await page.goto(String(href));
  await expect(page.getByRole("heading", { name: "归还确认", exact: true })).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.getByLabel("确认以上手机已全部交回公司").check();
  await page.getByLabel("确认设备外观和数量与页面一致").check();
  await page.getByLabel("确认本人已完成离职交接中的手机归还责任").check();
  await page.getByLabel("我已核对以上归还信息，并同意以本次勾选确认作为本人归还回执").check();

  const submitButton = page.getByRole("button", { name: "确认归还并提交回执" });
  await expect(submitButton).toBeEnabled();
  await submitButton.click();
  await expect(page).toHaveURL(/\/m\/return-success$/);

  await page.goto("/offboarding");
  const updatedCard = page.getByRole("article").filter({ hasText: employeeName }).first();
  await expect(updatedCard.getByText("已回收", { exact: true })).toBeVisible();
  await expect(updatedCard.getByText("勾选确认")).toBeVisible();

  await page.goto("/employees?status=离职");
  await expect(page.getByRole("article").filter({ hasText: employeeName }).first()).toBeVisible();

  await page.goto(`/devices?search=${deviceCode}`);
  await expect(page.getByText("当前状态：待分配")).toBeVisible();
});
