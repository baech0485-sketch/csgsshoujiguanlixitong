import { test, expect } from "@playwright/test";

test("应用根页面应能正常打开", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator("body")).toBeVisible();
  await expect(page.getByText("登录后台")).toBeVisible();
  await expect(page.getByLabel("记住密码")).toBeVisible();

  const passwordInput = page.getByLabel("密码", { exact: true });
  await expect(passwordInput).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "显示密码" }).click();
  await expect(passwordInput).toHaveAttribute("type", "text");

  const loginTitleSize = await page.locator(".auth-form__title h2").evaluate((node) => Number.parseFloat(window.getComputedStyle(node).fontSize));
  const accountInputHeight = await page.getByLabel("账号").evaluate((node) => Number.parseFloat(window.getComputedStyle(node).height));

  expect(loginTitleSize).toBeLessThanOrEqual(30);
  expect(accountInputHeight).toBeLessThanOrEqual(54);
});
