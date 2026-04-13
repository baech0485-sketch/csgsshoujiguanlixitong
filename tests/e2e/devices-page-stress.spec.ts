import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

test("设备页在快速筛选和切换速览时不应出现页面崩坏", async ({ page }) => {
  const serverFailures: string[] = [];

  page.on("response", (response) => {
    if (response.status() >= 500) {
      serverFailures.push(`${response.status()} ${response.url()}`);
    }
  });

  await loginAsAdmin(page);
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });
  await page.goto("/devices");

  const searchInput = page.getByLabel("搜索");
  const statusSelect = page.getByLabel("状态");

  for (let index = 0; index < 18; index += 1) {
    const keyword = `sj-${String((index % 9) + 1).padStart(2, "0")}`;
    await searchInput.fill(keyword);
    await page.waitForTimeout(360);

    const rows = page.locator(".device-row");
    if (await rows.count()) {
      await rows.first().click();
      await page.waitForTimeout(120);
    }

    const nextStatus = index % 3 === 0 ? "" : index % 3 === 1 ? "待分配" : "已分配";
    await statusSelect.selectOption(nextStatus);
    await page.waitForTimeout(360);

    await expect(page.getByText("This page couldn’t load")).toHaveCount(0);
    await expect(page.getByText("A server error occurred. Reload to try again.")).toHaveCount(0);
  }

  expect(serverFailures, serverFailures.join("\n")).toHaveLength(0);
});

test("设备页切换速览后再跳转和返回也不应出现页面崩坏", async ({ page }) => {
  const serverFailures: string[] = [];

  page.on("response", (response) => {
    if (response.status() >= 500) {
      serverFailures.push(`${response.status()} ${response.url()}`);
    }
  });

  await loginAsAdmin(page);
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });
  await page.goto("/devices");

  const rows = page.locator(".device-row");
  if (await rows.count()) {
    await rows.first().click();
    await page.waitForTimeout(300);
  }

  await page.getByRole("link", { name: "员工管理", exact: true }).click();
  await page.waitForURL(/\/employees/, { timeout: 15000 });
  await expect(page.getByText("This page couldn’t load")).toHaveCount(0);

  await page.goBack();
  await page.waitForURL(/\/devices/, { timeout: 15000 });
  await expect(page.getByText("This page couldn’t load")).toHaveCount(0);
  await expect(page.getByText("A server error occurred. Reload to try again.")).toHaveCount(0);
  expect(serverFailures, serverFailures.join("\n")).toHaveLength(0);
});
