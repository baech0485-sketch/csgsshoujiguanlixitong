import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

test("旧审批中心入口应跳转到领用分配工作台", async ({ page }) => {
  await loginAsAdmin(page);
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });

  await page.goto("/approvals");
  await page.waitForURL(/\/assignments$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: "领用分配", exact: true })).toBeVisible();
  await expect(page.getByLabel("搜索员工姓名")).toBeVisible();
  await expect(page.getByLabel("领取状态筛选")).toBeVisible();
});

test("领用分配工作台应展示分配生成的确认记录与链接", async ({ page }) => {
  await loginAsAdmin(page);
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });

  const suffix = String(Date.now()).slice(-6);
  const employeeName = `审批测试员工${suffix}`;

  await page.goto("/employees");
  await page.getByLabel("姓名").fill(employeeName);
  await page.getByLabel("部门", { exact: true }).selectOption("宜昌销售部");
  await page.getByRole("button", { name: "新增员工" }).click();
  const employeeCardSeed = page.getByRole("article").filter({ hasText: employeeName });
  await expect(employeeCardSeed.first()).toBeVisible({ timeout: 15000 });
  const employeeCode = (await employeeCardSeed.locator("p").first().textContent())?.split("·")[0]?.trim() || "";

  await page.goto("/devices?modal=new");
  const deviceCode = await page.getByLabel("手机编号").inputValue();
  await page.getByRole("textbox", { name: "品牌" }).fill("Apple");
  await page.getByRole("textbox", { name: "型号" }).fill("iPhone 14");
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
  const createAssignmentResponse = page.waitForResponse((response) => response.url().includes("/api/assignments/execute") && response.request().method() === "POST" && response.status() === 201);
  await page.getByRole("button", { name: "提交分配" }).click();
  await createAssignmentResponse;

  await page.goto("/assignments");
  await expect(page.getByLabel("搜索员工姓名")).toBeVisible();
  await expect(page.getByLabel("领取状态筛选")).toBeVisible();
  const approvalCard = page.getByRole("article").filter({ hasText: employeeName }).first();
  await expect(approvalCard).toBeVisible({ timeout: 15000 });
  await expect(approvalCard).toContainText(deviceCode);
  await expect(approvalCard.getByText("待领取", { exact: true })).toBeVisible();
  await expect(approvalCard.getByRole("button", { name: /领取确认链接/i })).toBeVisible();

  await page.getByLabel("搜索员工姓名").fill(employeeName);
  await expect(page).toHaveURL(new RegExp(`search=${encodeURIComponent(employeeName)}`));
  await expect(page.getByRole("article").filter({ hasText: employeeName })).toHaveCount(1);

  await page.getByLabel("领取状态筛选").selectOption("已领取");
  await expect(page).toHaveURL(/status=%E5%B7%B2%E9%A2%86%E5%8F%96/);
  await expect(page.getByRole("article").filter({ hasText: employeeName })).toHaveCount(0);

  await page.getByLabel("领取状态筛选").selectOption("待领取");
  await expect(page).toHaveURL(/status=%E5%BE%85%E9%A2%86%E5%8F%96/);
  await expect(page.getByRole("article").filter({ hasText: employeeName })).toHaveCount(1);
});

test("领用分配工作台应在员工勾选确认后同步显示已领取结果", async ({ page }) => {
  await loginAsAdmin(page);
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });

  const suffix = String(Date.now()).slice(-6);
  const employeeName = `审批签字员工${suffix}`;

  await page.goto("/employees");
  await page.getByLabel("姓名").fill(employeeName);
  await page.getByLabel("部门", { exact: true }).selectOption("武汉销售部");
  await page.getByRole("button", { name: "新增员工" }).click();
  const employeeCardSeed = page.getByRole("article").filter({ hasText: employeeName });
  await expect(employeeCardSeed.first()).toBeVisible({ timeout: 15000 });
  const employeeCode = (await employeeCardSeed.locator("p").first().textContent())?.split("·")[0]?.trim() || "";

  await page.goto("/devices?modal=new");
  const deviceCode = await page.getByLabel("手机编号").inputValue();
  await page.getByRole("textbox", { name: "品牌" }).fill("Apple");
  await page.getByRole("textbox", { name: "型号" }).fill("iPhone 15");
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
  const createAssignmentResponse = page.waitForResponse((response) => response.url().includes("/api/assignments/execute") && response.request().method() === "POST" && response.status() === 201);
  await page.getByRole("button", { name: "提交分配" }).click();
  const assignmentResponse = await createAssignmentResponse;
  const assignmentPayload = (await assignmentResponse.json()) as { confirmUrl?: string };
  expect(assignmentPayload.confirmUrl).toBeTruthy();
  const href = assignmentPayload.confirmUrl;

  await page.goto(String(href));
  await page.getByLabel("确认设备外观完好").check();
  await page.getByLabel("确认手机编号与页面一致").check();
  await page.getByLabel("确认责任人为本人").check();
  await page.getByLabel("同意妥善保管设备").check();
  await page.getByLabel("我已核对以上信息，并同意以本次勾选确认作为本人签收凭证").check();
  await page.getByRole("button", { name: "确认领取并提交回执" }).click();
  await expect(page).toHaveURL(/\/m\/receipt-success$/);

  await page.goto("/assignments");
  const approvalCard = page.getByRole("article").filter({ hasText: employeeName }).first();
  await expect(approvalCard).toBeVisible();
  await expect(approvalCard.getByText("已领取", { exact: true })).toBeVisible();
  await expect(approvalCard.getByText(/确认时间/)).toBeVisible();
  await expect(approvalCard.getByText("勾选确认")).toBeVisible();

  await page.getByLabel("领取状态筛选").selectOption("已领取");
  await expect(page).toHaveURL(/status=%E5%B7%B2%E9%A2%86%E5%8F%96/);
  await expect(page.getByRole("article").filter({ hasText: employeeName })).toHaveCount(1);

  await page.getByLabel("搜索员工姓名").fill(employeeName);
  await expect(page).toHaveURL(new RegExp(`search=${encodeURIComponent(employeeName)}`));
  await expect(page.getByRole("article").filter({ hasText: employeeName })).toHaveCount(1);
});

test("领取确认记录应支持删除待领取记录并回退手机状态", async ({ page }) => {
  await loginAsAdmin(page);
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });

  const suffix = String(Date.now()).slice(-6);
  const employeeName = `删除记录员工${suffix}`;

  await page.goto("/employees");
  await page.getByLabel("姓名").fill(employeeName);
  await page.getByLabel("部门", { exact: true }).selectOption("武汉销售部");
  await page.getByRole("button", { name: "新增员工" }).click();
  const employeeCardSeed = page.getByRole("article").filter({ hasText: employeeName });
  await expect(employeeCardSeed.first()).toBeVisible({ timeout: 15000 });
  const employeeCode = (await employeeCardSeed.locator("p").first().textContent())?.split("·")[0]?.trim() || "";

  await page.goto("/devices?modal=new");
  const deviceCode = await page.getByLabel("手机编号").inputValue();
  await page.getByRole("textbox", { name: "品牌" }).fill("Apple");
  await page.getByRole("textbox", { name: "型号" }).fill("iPhone Delete Flow");
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
  await Promise.all([
    page.waitForResponse((response) => response.url().includes("/api/assignments/execute") && response.request().method() === "POST" && response.status() === 201),
    page.getByRole("button", { name: "提交分配" }).click(),
  ]);

  await page.goto("/assignments");
  const approvalCard = page.getByRole("article").filter({ hasText: employeeName }).first();
  await expect(approvalCard).toBeVisible({ timeout: 15000 });

  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });
  await Promise.all([
    page.waitForResponse((response) => /\/api\/approvals\/.+/.test(response.url()) && response.request().method() === "DELETE" && response.status() === 200),
    approvalCard.getByRole("button", { name: "删除记录" }).click(),
  ]);

  await expect(page.getByRole("article").filter({ hasText: employeeName })).toHaveCount(0);

  await page.goto(`/devices?search=${deviceCode}`);
  await expect(page.getByText("当前状态：待分配")).toBeVisible();
});
