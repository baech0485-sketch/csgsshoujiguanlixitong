import { test, expect } from "@playwright/test";

test("管理员应能通过登录页进入仪表盘", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("登录密码", { exact: true }).fill("CSGS@2026!Admin");
  await page.getByRole("button", { name: "登录系统" }).click();
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });
  await expect(page.getByText("资产概览")).toBeVisible();
  await expect(page.getByText("系统管理员 · csgs_admin")).toBeVisible();
  await expect(page.getByText("设备状态总览")).toBeVisible();
  await expect(page.getByText("流程待办总览")).toBeVisible();
  await expect(page.getByText("云数据库状态")).toBeVisible();
  await expect(page.getByText("已连接")).toBeVisible();
  await expect(page.getByRole("button", { name: "退出登录" })).toBeVisible();

  await page.getByRole("button", { name: "退出登录" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText("登录后台")).toBeVisible();
  await expect(page.getByLabel("记住密码")).toBeChecked();
  await expect(page.getByLabel("登录密码", { exact: true })).toHaveValue("CSGS@2026!Admin");
  await expect(page.getByText("当前登录管理员：csgs_admin")).toBeVisible();
});
