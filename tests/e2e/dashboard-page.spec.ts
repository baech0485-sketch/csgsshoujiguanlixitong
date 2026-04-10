import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

test("仪表盘应展示基于真实业务状态的总览看板", async ({ page }) => {
  await loginAsAdmin(page);
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });

  await expect(page.getByRole("heading", { name: "资产概览", exact: true })).toBeVisible();
  await expect(page.getByText("设备状态总览")).toBeVisible();
  await expect(page.getByText("员工状态总览")).toBeVisible();
  await expect(page.getByText("流程待办总览")).toBeVisible();
  await expect(page.getByText("最近资产变动")).toBeVisible();
  await expect(page.getByText("云数据库状态")).toBeVisible();
  await expect(page.getByText("近 30 天流转趋势")).toHaveCount(0);
  await expect(page.getByText("生命周期分布")).toHaveCount(0);
  await expect(page.getByText("待办事项")).toHaveCount(0);
});
