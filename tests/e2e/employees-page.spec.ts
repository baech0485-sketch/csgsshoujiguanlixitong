import { expect, test, type Locator } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

async function expectEditChipBelowStatus(employeeCard: Locator) {
  const statusBadge = employeeCard.getByText("在职", { exact: true });
  const editChip = employeeCard.getByText("点击编辑", { exact: true });
  const statusBox = await statusBadge.boundingBox();
  const editBox = await editChip.boundingBox();

  expect(statusBox).not.toBeNull();
  expect(editBox).not.toBeNull();
  expect(editBox!.y).toBeGreaterThanOrEqual(statusBox!.y + statusBox!.height);
  expect(Math.abs((statusBox!.x + statusBox!.width) - (editBox!.x + editBox!.width))).toBeLessThanOrEqual(4);
}

test("员工管理页应支持新增员工并展示员工台账", async ({ page }) => {
  await loginAsAdmin(page);
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });

  await page.goto("/employees");

  await expect(page.getByRole("heading", { name: "员工管理" })).toBeVisible();
  await expect(page.getByRole("button", { name: "查询员工" })).toHaveCount(0);
  const uniqueName = `测试员工${Date.now()}`;
  await expect(page.getByLabel("员工编号")).toHaveValue(/cs-\d{2,}/);
  await page.getByLabel("姓名").fill(uniqueName);
  await page.getByLabel("部门", { exact: true }).selectOption("武汉销售部");
  await expect(page.getByLabel("岗位")).toHaveValue("销售");
  await page.getByRole("button", { name: "新增员工" }).click();

  const employeeCard = page.getByRole("article").filter({ hasText: uniqueName });
  await expect(employeeCard).toBeVisible();
  await expect(employeeCard.getByText(uniqueName, { exact: true })).toBeVisible();
  await expect(employeeCard.getByText("在职", { exact: true })).toBeVisible();
  await expect(employeeCard.getByRole("button", { name: `编辑员工 ${uniqueName}` })).toBeVisible();
  await expectEditChipBelowStatus(employeeCard);
  await expect(page.getByLabel("部门筛选")).toBeVisible();
  await page.getByLabel("部门筛选").selectOption("宜昌销售部");
  await page.waitForURL(/department=%E5%AE%9C%E6%98%8C%E9%94%80%E5%94%AE%E9%83%A8/, { timeout: 15000 });
  await expect(page.getByRole("article").filter({ hasText: uniqueName })).toHaveCount(0);
  await page.getByLabel("部门筛选").selectOption("武汉销售部");
  await page.waitForURL(/department=%E6%AD%A6%E6%B1%89%E9%94%80%E5%94%AE%E9%83%A8/, { timeout: 15000 });
  await page.getByLabel("搜索员工").fill(uniqueName);
  await page.waitForURL(new RegExp(`search=${encodeURIComponent(uniqueName)}`), { timeout: 15000 });
  await expect(employeeCard).toBeVisible();
});

test("员工卡片应支持点击进入编辑并保存修改", async ({ page }) => {
  await loginAsAdmin(page);
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });

  await page.goto("/employees");

  const uniqueName = `测试员工${Date.now()}`;
  const updatedName = `${uniqueName}-已修改`;
  await page.getByLabel("姓名").fill(uniqueName);
  await page.getByLabel("部门", { exact: true }).selectOption("武汉销售部");
  await page.getByRole("button", { name: "新增员工" }).click();

  const employeeCard = page.getByRole("article").filter({ hasText: uniqueName });
  await expect(employeeCard).toBeVisible();
  await employeeCard.getByRole("button", { name: `编辑员工 ${uniqueName}` }).click();

  await expect(page.getByRole("heading", { name: "编辑员工信息", exact: true })).toBeVisible();
  await expect(page.getByLabel("编辑员工编号")).toHaveValue(/cs-\d{2,}/);
  await page.getByLabel("编辑姓名").fill(updatedName);
  await page.getByLabel("编辑部门").selectOption("宜昌销售部");
  await page.getByLabel("编辑岗位").fill("招商主管");
  await page.getByRole("button", { name: "保存员工信息" }).click();

  await expect(page.getByRole("heading", { name: "编辑员工信息", exact: true })).toHaveCount(0);
  await page.getByLabel("部门筛选").selectOption("宜昌销售部");
  await page.waitForURL(/department=%E5%AE%9C%E6%98%8C%E9%94%80%E5%94%AE%E9%83%A8/, { timeout: 15000 });
  await page.getByLabel("搜索员工").fill(updatedName);
  await page.waitForURL(new RegExp(`search=${encodeURIComponent(updatedName)}`), { timeout: 15000 });

  const updatedCard = page.getByRole("article").filter({ hasText: updatedName });
  await expect(updatedCard).toBeVisible();
  await expect(updatedCard).toContainText("招商主管");
  await expectEditChipBelowStatus(updatedCard);
  await expect(page.getByText(uniqueName, { exact: true })).toHaveCount(0);
});
