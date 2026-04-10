import { expect, test } from "@playwright/test";

test("员工管理页应支持新增员工并展示员工台账", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("账号").fill("csgs_admin");
  await page.getByLabel("密码", { exact: true }).fill("CSGS@2026!Admin");
  await page.getByRole("button", { name: "登录系统" }).click();
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
  await expect(employeeCard.getByRole("button")).toHaveCount(0);
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
