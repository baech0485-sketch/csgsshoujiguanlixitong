import { expect, type Page } from "@playwright/test";

export async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await expect(page.getByText("当前登录管理员：csgs_admin")).toBeVisible();
  await page.getByLabel("登录密码", { exact: true }).fill("CSGS@2026!Admin");
  await page.getByRole("button", { name: "登录系统" }).click();
}
