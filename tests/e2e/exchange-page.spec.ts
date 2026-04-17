import { expect, test, type Page } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

async function createEmployee(page: Page, name: string, department = "武汉销售部") {
  await page.goto("/employees");
  await page.getByLabel("姓名").fill(name);
  await page.getByLabel("部门", { exact: true }).selectOption(department);
  const createResponsePromise = page.waitForResponse((response) =>
    response.url().includes("/api/employees")
    && response.request().method() === "POST"
    && response.status() === 201,
  );
  await page.getByRole("button", { name: "新增员工" }).click();
  const createResponse = await createResponsePromise;
  const payload = (await createResponse.json()) as { employeeCode?: string };

  expect(payload.employeeCode).toBeTruthy();
  return String(payload.employeeCode);
}

async function createDevice(page: Page, model: string) {
  await page.goto("/devices?modal=new");
  const deviceCode = await page.getByLabel("手机编号").inputValue();
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
  return deviceCode;
}

async function assignAndConfirm(page: Page, employeeCode: string, deviceCode: string) {
  await page.goto("/assignments");
  await page.getByLabel("选择员工").selectOption(employeeCode);
  await page.getByLabel(`选择设备 ${deviceCode}`).check();
  const createResponsePromise = page.waitForResponse((response) =>
    response.url().includes("/api/assignments/execute")
    && response.request().method() === "POST"
    && response.status() === 201,
  );
  await page.getByRole("button", { name: "提交分配" }).click();
  const createResponse = await createResponsePromise;
  const payload = (await createResponse.json()) as { confirmUrl?: string };

  expect(payload.confirmUrl).toBeTruthy();
  await page.goto(String(payload.confirmUrl));
  await page.getByLabel("确认设备外观完好").check();
  await page.getByLabel("确认手机编号与页面一致").check();
  await page.getByLabel("确认责任人为本人").check();
  await page.getByLabel("同意妥善保管设备").check();
  await page.getByLabel("我已核对以上信息，并同意以本次勾选确认作为本人签收凭证").check();
  await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes("/api/workflows/receipt-confirm")
      && response.request().method() === "POST"
      && response.ok(),
    ),
    page.getByRole("button", { name: "确认领取并提交回执" }).click(),
  ]);
}

test("相互交换页应支持在两名员工之间交换已领取手机", async ({ page }) => {
  await loginAsAdmin(page);
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });

  const suffix = String(Date.now()).slice(-6);
  const sourceName = `交换员工甲${suffix}`;
  const targetName = `交换员工乙${suffix}`;
  const sourceEmployeeCode = await createEmployee(page, sourceName, "武汉销售部");
  const targetEmployeeCode = await createEmployee(page, targetName, "宜昌销售部");
  const sourceDeviceCode = await createDevice(page, "iPhone Exchange A");
  const targetDeviceCode = await createDevice(page, "iPhone Exchange B");

  await assignAndConfirm(page, sourceEmployeeCode, sourceDeviceCode);
  await assignAndConfirm(page, targetEmployeeCode, targetDeviceCode);

  await page.goto("/dashboard");
  await page.getByRole("link", { name: "相互交换", exact: true }).click();
  await page.waitForURL(/\/exchange$/, { timeout: 15000 });

  await expect(page.getByRole("heading", { name: "相互交换", exact: true })).toBeVisible();
  await page.getByLabel("选择员工甲").selectOption(sourceEmployeeCode);
  await page.getByLabel("选择员工乙").selectOption(targetEmployeeCode);
  await expect(page.getByText(sourceDeviceCode, { exact: true })).toBeVisible();
  await expect(page.getByText(targetDeviceCode, { exact: true })).toBeVisible();
  await page.getByLabel(`勾选员工甲设备 ${sourceDeviceCode}`).check();
  await page.getByLabel(`勾选员工乙设备 ${targetDeviceCode}`).check();

  await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes("/api/exchanges")
      && response.request().method() === "POST"
      && response.ok(),
    ),
    page.getByRole("button", { name: "执行相互交换" }).click(),
  ]);

  await expect(page.getByText("手机交换已完成", { exact: true })).toBeVisible();
  await expect(page.getByRole("article").filter({ hasText: sourceName }).getByText(targetDeviceCode, { exact: true })).toBeVisible();
  await expect(page.getByRole("article").filter({ hasText: targetName }).getByText(sourceDeviceCode, { exact: true })).toBeVisible();
});

test("相互交换页应支持切换到单向交换并仅转移员工甲的手机", async ({ page }) => {
  await loginAsAdmin(page);
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });

  const suffix = String(Date.now()).slice(-6);
  const sourceName = `单向员工甲${suffix}`;
  const targetName = `单向员工乙${suffix}`;
  const sourceEmployeeCode = await createEmployee(page, sourceName, "武汉销售部");
  const targetEmployeeCode = await createEmployee(page, targetName, "宜昌销售部");
  const sourceDeviceCode = await createDevice(page, "iPhone One Way A");

  await assignAndConfirm(page, sourceEmployeeCode, sourceDeviceCode);

  await page.goto("/exchange");
  await expect(page.getByRole("heading", { name: "相互交换", exact: true })).toBeVisible();
  await page.getByLabel("交换模式").selectOption("unidirectional");
  await page.getByLabel("选择员工甲").selectOption(sourceEmployeeCode);
  await page.getByLabel("选择员工乙").selectOption(targetEmployeeCode);
  await expect(page.getByText("单向交换时，员工乙无需勾选自己的手机。", { exact: true })).toBeVisible();
  await page.getByLabel(`勾选员工甲设备 ${sourceDeviceCode}`).check();

  await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes("/api/exchanges")
      && response.request().method() === "POST"
      && response.ok(),
    ),
    page.getByRole("button", { name: "执行单向交换" }).click(),
  ]);

  await expect(page.getByText("手机交换已完成", { exact: true })).toBeVisible();
  const sourcePanel = page.getByRole("article").filter({ has: page.getByLabel("选择员工甲") }).first();
  const targetPanel = page.getByRole("article").filter({ has: page.getByLabel("选择员工乙") }).first();
  await expect(sourcePanel).toContainText("已分配 0 台");
  await expect(targetPanel).toContainText("已分配 1 台");
  await expect(targetPanel.getByText(sourceDeviceCode, { exact: true })).toBeVisible();
});
