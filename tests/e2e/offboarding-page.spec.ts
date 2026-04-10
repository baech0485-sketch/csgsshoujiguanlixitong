import { expect, test } from "@playwright/test";

test("离职回收页应按员工带出名下设备并生成归还确认链接", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("账号").fill("csgs_admin");
  await page.getByLabel("密码", { exact: true }).fill("CSGS@2026!Admin");
  await page.getByRole("button", { name: "登录系统" }).click();
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });

  const suffix = String(Date.now()).slice(-6);
  const employeeName = `离职测试员工${suffix}`;

  await page.goto("/employees");
  await page.getByLabel("姓名").fill(employeeName);
  await page.getByLabel("部门", { exact: true }).selectOption("宜昌销售部");
  await page.getByRole("button", { name: "新增员工" }).click();
  const employeeCardSeed = page.getByRole("article").filter({ hasText: employeeName });
  const employeeCode = (await employeeCardSeed.locator("p").first().textContent())?.split("·")[0]?.trim() || "";

  await page.goto("/devices?modal=new");
  const deviceCode = await page.getByLabel("手机编号").inputValue();
  await page.getByRole("textbox", { name: "品牌" }).fill("Apple");
  await page.getByRole("textbox", { name: "型号" }).fill("iPhone 13 Pro");
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

  const assignmentCard = page.getByRole("article").filter({ hasText: employeeName }).first();
  await expect(assignmentCard).toBeVisible({ timeout: 15000 });

  await page.goto("/offboarding");
  await page.getByLabel("选择在职员工").selectOption(employeeCode);
  await expect(page.getByLabel("离职日期")).toHaveValue(/\d{4}-\d{2}-\d{2}/);
  await expect(page.getByLabel("离职日期")).toHaveAttribute("readonly", "");
  await expect(page.getByText("待回收手机预览")).toBeVisible();
  await expect(page.getByText(deviceCode)).toBeVisible();
  await page.getByRole("button", { name: "生成离职回收链接" }).click();

  const offboardingCard = page.getByRole("article").filter({ hasText: employeeName }).first();
  await expect(offboardingCard).toBeVisible();
  await expect(offboardingCard.getByText("待回收", { exact: true })).toBeVisible();
  await expect(offboardingCard.getByRole("button", { name: /归还确认链接/i })).toBeVisible();
});
