import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

test("员工应可通过领取确认链接勾选确认并完成领用", async ({ page }) => {
  await loginAsAdmin(page);
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });

  const suffix = String(Date.now()).slice(-6);
  const employeeName = `领用测试员工${suffix}`;

  await page.goto("/employees");
  await page.getByLabel("姓名").fill(employeeName);
  await page.getByLabel("部门", { exact: true }).selectOption("武汉销售部");
  await page.getByRole("button", { name: "新增员工" }).click();
  const employeeCardSeed = page.getByRole("article").filter({ hasText: employeeName });
  const employeeCode = (await employeeCardSeed.locator("p").first().textContent())?.split("·")[0]?.trim() || "";

  await page.goto("/devices?modal=new");
  const deviceCode = await page.getByLabel("手机编号").inputValue();
  await page.getByRole("textbox", { name: "品牌" }).fill("Apple");
  await page.getByRole("textbox", { name: "型号" }).fill("iPhone 15 Pro");
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

  const assignmentCard = page.getByRole("article").filter({ hasText: employeeName }).first();
  await expect(assignmentCard).toBeVisible();
  const href = await assignmentCard.getByRole("button", { name: /领取确认链接/i }).getAttribute("data-link-value");
  expect(href).toBeTruthy();

  await page.goto(String(href));
  await expect(page.getByRole("heading", { name: "领用确认" })).toBeVisible();
  await page.getByLabel("确认设备外观完好").check();
  await page.getByLabel("确认手机编号与页面一致").check();
  await page.getByLabel("确认责任人为本人").check();
  await page.getByLabel("同意妥善保管设备").check();
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.getByLabel("我已核对以上信息，并同意以本次勾选确认作为本人签收凭证").check();

  const confirmButton = page.getByRole("button", { name: "确认领取并提交回执" });
  await expect(confirmButton).toBeEnabled();
  await confirmButton.click();
  await expect(page).toHaveURL(/\/m\/receipt-success$/);
});

test("同一员工多手机分配时领取确认链接内应展示多台手机", async ({ page }) => {
  await loginAsAdmin(page);
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });

  const suffix = String(Date.now()).slice(-6);
  const employeeName = `多机领用员工${suffix}`;

  await page.goto("/employees");
  await page.getByLabel("姓名").fill(employeeName);
  await page.getByLabel("部门", { exact: true }).selectOption("武汉销售部");
  await page.getByRole("button", { name: "新增员工" }).click();
  const employeeCardSeed = page.getByRole("article").filter({ hasText: employeeName });
  const employeeCode = (await employeeCardSeed.locator("p").first().textContent())?.split("·")[0]?.trim() || "";

  const deviceCodes: string[] = [];
  for (const model of ["iPhone 16", "iPhone 16 Pro"]) {
    await page.goto("/devices?modal=new");
    const code = await page.getByLabel("手机编号").inputValue();
    deviceCodes.push(code);
    await page.getByRole("textbox", { name: "品牌" }).fill("Apple");
    await page.getByRole("textbox", { name: "型号" }).fill(model);
    await page.getByRole("textbox", { name: "存储容量" }).fill("256G");
    await page.getByRole("textbox", { name: "序列号" }).fill(`SN-${model}-${Date.now()}`);
    await page.getByLabel("上传手机图片").setInputFiles({
      name: "phone.png",
      mimeType: "image/png",
      buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+cC1UAAAAASUVORK5CYII=", "base64"),
    });
    await page.getByRole("button", { name: "提交录入" }).click();
    await page.waitForURL(/\/devices\?selected=sj-\d{2,}$/);
  }

  await page.goto("/assignments");
  await page.getByLabel("选择员工").selectOption(employeeCode);
  await page.getByLabel(`选择设备 ${deviceCodes[0]}`).check();
  await page.getByLabel(`选择设备 ${deviceCodes[1]}`).check();
  await page.getByRole("button", { name: "提交分配" }).click();

  const assignmentCard = page.getByRole("article").filter({ hasText: employeeName }).first();
  const href = await assignmentCard.getByRole("button", { name: /领取确认链接/i }).getAttribute("data-link-value");
  expect(href).toBeTruthy();

  await page.goto(String(href));
  await expect(page.getByRole("article").filter({ hasText: deviceCodes[0] })).toBeVisible();
  await expect(page.getByRole("article").filter({ hasText: deviceCodes[1] })).toBeVisible();
});
