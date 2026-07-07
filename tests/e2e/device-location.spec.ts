import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

test("手机资产页应展示并筛选手机所在地", async ({ page }) => {
  let requestedLocation = "";

  await page.route("**/api/devices/page-data**", async (route) => {
    const url = new URL(route.request().url());
    requestedLocation = url.searchParams.get("location") || "";
    const rows = requestedLocation === "武汉"
      ? [
        {
          code: "sj-49",
          model: "Apple iPhone 15 / 256G",
          owner: "库存",
          status: "待分配",
          location: "武汉",
          date: "2026-06-04 10:00",
          tone: "selected",
        },
      ]
      : [
        {
          code: "sj-42",
          model: "Apple iPhone 14 / 128G",
          owner: "库存",
          status: "待分配",
          location: "宜昌",
          date: "2026-06-04 09:00",
          tone: "selected",
        },
        {
          code: "sj-49",
          model: "Apple iPhone 15 / 256G",
          owner: "库存",
          status: "待分配",
          location: "武汉",
          date: "2026-06-04 10:00",
          tone: "selected",
        },
      ];

    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        rows,
        owners: ["库存"],
        selectedRow: rows[0],
        pagination: { page: 1, pageSize: 10, totalItems: rows.length, totalPages: 1, skip: 0, limit: 10, hasPrev: false, hasNext: false },
        statusCards: [],
      }),
    });
  });

  await loginAsAdmin(page);
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });
  await page.goto("/devices");

  await expect(page.getByLabel("所在地")).toBeVisible();
  await expect(page.getByRole("link", { name: /sj-42/ })).toContainText("宜昌");
  await expect(page.getByRole("link", { name: /sj-49/ })).toContainText("武汉");
  await expect(page.getByText("当前所在地：宜昌")).toBeVisible();

  await page.getByLabel("所在地").selectOption("武汉");
  await page.waitForURL(/location=%E6%AD%A6%E6%B1%89/, { timeout: 15000 });
  await expect.poll(() => requestedLocation).toBe("武汉");
  await expect(page.getByRole("link", { name: /sj-49/ })).toContainText("武汉");
  await expect(page.getByRole("link", { name: /sj-42/ })).toHaveCount(0);
});
