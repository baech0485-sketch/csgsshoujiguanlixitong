import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

test("异常管理页应支持按员工搜索并生成异常确认链接", async ({ page }) => {
  await loginAsAdmin(page);
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });

  const suffix = String(Date.now()).slice(-6);
  const employeeName = `异常测试员工${suffix}`;

  await page.goto("/employees");
  await page.getByLabel("姓名").fill(employeeName);
  await page.getByLabel("部门", { exact: true }).selectOption("武汉销售部");
  await page.getByRole("button", { name: "新增员工" }).click();
  const employeeCard = page.getByRole("article").filter({ hasText: employeeName }).first();
  const employeeCode = (await employeeCard.locator("p").first().textContent())?.split("·")[0]?.trim() || "";

  await page.goto("/devices?modal=new");
  const deviceCode = await page.getByLabel("手机编号").inputValue();
  await page.getByRole("textbox", { name: "品牌" }).fill("Apple");
  await page.getByRole("textbox", { name: "型号" }).fill("iPhone 15");
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

  await page.goto("/incidents");
  await page.getByLabel("搜索员工").fill(employeeName);
  await page.getByLabel("选择员工").selectOption(employeeCode);
  await expect(page.getByRole("article").filter({ hasText: deviceCode }).first()).toBeVisible();
  await page.getByLabel("选择异常手机").selectOption(deviceCode);
  await page.getByLabel("异常类型").selectOption("维修");
  await page.getByRole("button", { name: "生成异常确认链接" }).click();

  const incidentCard = page.getByRole("article").filter({ hasText: employeeName }).first();
  await expect(incidentCard).toBeVisible();
  await expect(incidentCard.getByRole("button", { name: /异常确认链接/i })).toBeVisible();
  await expect(incidentCard.getByText("待员工确认").first()).toBeVisible();
});

test("员工确认异常后设备应进入维修中且员工卡片应显示维修数量", async ({ page }) => {
  await loginAsAdmin(page);
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });

  const suffix = String(Date.now()).slice(-6);
  const employeeName = `异常确认员工${suffix}`;

  await page.goto("/employees");
  await page.getByLabel("姓名").fill(employeeName);
  await page.getByLabel("部门", { exact: true }).selectOption("宜昌销售部");
  await page.getByRole("button", { name: "新增员工" }).click();
  const employeeCard = page.getByRole("article").filter({ hasText: employeeName }).first();
  const employeeCode = (await employeeCard.locator("p").first().textContent())?.split("·")[0]?.trim() || "";

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

  await page.goto("/incidents");
  await page.getByLabel("搜索员工").fill(employeeName);
  await page.getByLabel("选择员工").selectOption(employeeCode);
  await page.getByLabel("选择异常手机").selectOption(deviceCode);
  await page.getByLabel("异常类型").selectOption("丢失");
  await page.getByRole("button", { name: "生成异常确认链接" }).click();

  const incidentCard = page.getByRole("article").filter({ hasText: employeeName }).first();
  const href = await incidentCard.getByRole("button", { name: /异常确认链接/i }).getAttribute("data-link-value");
  expect(href).toBeTruthy();

  await page.goto(String(href));
  await expect(page.getByRole("heading", { name: "异常确认", exact: true })).toBeVisible();
  await page.getByLabel("确认以上异常情况属实").check();
  await page.getByLabel("确认该手机当前由本人负责使用").check();
  await page.getByLabel("确认知晓该手机会转入维修中处理").check();
  await page.getByLabel("我已核对以上异常信息，并同意以本次勾选确认作为本人异常回执").check();
  await page.getByRole("button", { name: "确认异常并提交回执" }).click();
  await expect(page).toHaveURL(/\/m\/incident-success$/);

  await page.goto(`/devices?search=${deviceCode}`);
  await expect(page.getByText("当前状态：修理中")).toBeVisible();

  await page.goto("/employees");
  const updatedEmployeeCard = page.getByRole("article").filter({ hasText: employeeName }).first();
  await expect(updatedEmployeeCard).toContainText("维修中 1 台");
});

test("异常管理页应展示维修中手机列表并支持维修完成后恢复状态", async ({ page }) => {
  await loginAsAdmin(page);
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });

  const suffix = String(Date.now()).slice(-6);
  const employeeName = `维修完成员工${suffix}`;

  await page.goto("/employees");
  await page.getByLabel("姓名").fill(employeeName);
  await page.getByLabel("部门", { exact: true }).selectOption("武汉销售部");
  await page.getByRole("button", { name: "新增员工" }).click();
  const employeeCard = page.getByRole("article").filter({ hasText: employeeName }).first();
  const employeeCode = (await employeeCard.locator("p").first().textContent())?.split("·")[0]?.trim() || "";

  await page.goto("/devices?modal=new");
  const deviceCode = await page.getByLabel("手机编号").inputValue();
  await page.getByRole("textbox", { name: "品牌" }).fill("Apple");
  await page.getByRole("textbox", { name: "型号" }).fill("iPhone 13");
  await page.getByRole("textbox", { name: "存储容量" }).fill("128G");
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

  await page.goto("/incidents");
  await page.getByLabel("搜索员工").fill(employeeName);
  await page.getByLabel("选择员工").selectOption(employeeCode);
  await page.getByLabel("选择异常手机").selectOption(deviceCode);
  await page.getByLabel("异常类型").selectOption("维修");
  await page.getByRole("button", { name: "生成异常确认链接" }).click();

  const incidentCard = page.getByRole("article").filter({ hasText: employeeName }).first();
  const href = await incidentCard.getByRole("button", { name: /异常确认链接/i }).getAttribute("data-link-value");
  expect(href).toBeTruthy();

  await page.goto(String(href));
  await page.getByLabel("确认以上异常情况属实").check();
  await page.getByLabel("确认该手机当前由本人负责使用").check();
  await page.getByLabel("确认知晓该手机会转入维修中处理").check();
  await page.getByLabel("我已核对以上异常信息，并同意以本次勾选确认作为本人异常回执").check();
  await page.getByRole("button", { name: "确认异常并提交回执" }).click();
  await expect(page).toHaveURL(/\/m\/incident-success$/);

  await page.goto("/incidents");
  const recordPanel = page.locator(".panel").filter({ has: page.getByRole("heading", { name: "异常确认记录" }) }).first();
  await expect(page.getByRole("button", { name: "查看维修中手机" })).toBeVisible();
  await expect(page.getByLabel("搜索异常记录")).toBeVisible();
  await page.getByLabel("搜索异常记录").fill(employeeName);
  await expect(recordPanel.getByRole("article").filter({ hasText: employeeName }).first()).toBeVisible();

  await page.getByRole("button", { name: "查看维修中手机" }).click();
  const repairDialog = page.locator(".modal-card").filter({ has: page.getByRole("heading", { name: "维修中手机列表" }) }).first();
  await expect(repairDialog).toBeVisible();
  await expect(repairDialog.getByLabel("搜索维修手机")).toBeVisible();
  await repairDialog.getByLabel("搜索维修手机").fill(deviceCode);
  const repairCard = repairDialog.getByRole("article").filter({ hasText: deviceCode }).first();
  await expect(repairCard).toBeVisible();
  await expect(repairCard).toContainText("维修中");

  await Promise.all([
    page.waitForResponse((response) => response.url().includes("/api/incidents") && response.request().method() === "PATCH" && response.ok()),
    repairCard.getByRole("button", { name: "维修完成" }).click(),
  ]);

  await expect(repairDialog.getByRole("article").filter({ hasText: deviceCode })).toHaveCount(0);
  await page.goto(`/devices?search=${deviceCode}`);
  await expect(page.getByText("当前状态：已分配")).toBeVisible();

  await page.goto("/employees");
  const refreshedEmployeeCard = page.getByRole("article").filter({ hasText: employeeName }).first();
  await expect(refreshedEmployeeCard).toContainText("维修中 0 台");
});
