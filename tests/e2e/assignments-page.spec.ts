import { expect, test } from "@playwright/test";

test("领用分配页应支持同一员工一次分配多台手机并生成单个领取确认链接", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("账号").fill("csgs_admin");
  await page.getByLabel("密码", { exact: true }).fill("CSGS@2026!Admin");
  await page.getByRole("button", { name: "登录系统" }).click();
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });

  const suffix = String(Date.now()).slice(-6);
  const employeeName = `分配测试员工${suffix}`;

  await page.goto("/employees");
  await page.getByLabel("姓名").fill(employeeName);
  await page.getByLabel("部门", { exact: true }).selectOption("武汉销售部");
  await page.getByRole("button", { name: "新增员工" }).click();
  const employeeCard = page.getByRole("article").filter({ hasText: employeeName });
  const employeeCode = (await employeeCard.locator("p").first().textContent())?.split("·")[0]?.trim() || "";

  const deviceCodes: string[] = [];
  for (const model of ["iPhone 15", "iPhone 14 Pro"]) {
    await page.goto("/devices?modal=new");
    const deviceCode = await page.getByLabel("手机编号").inputValue();
    deviceCodes.push(deviceCode);
    await page.getByRole("textbox", { name: "品牌" }).fill("Apple");
    await page.getByRole("textbox", { name: "型号" }).fill(model);
    await page.getByRole("textbox", { name: "存储容量" }).fill("256G");
    await page.getByRole("textbox", { name: "序列号" }).fill(`SN-${model}-${Date.now()}`);
    await page.getByLabel("上传手机图片").setInputFiles({
      name: "phone.png",
      mimeType: "image/png",
      buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+cC1UAAAAASUVORK5CYII=", "base64"),
    });
    await page.getByRole("button", { name: "提交录入" }).click();
    await page.waitForURL(/\/devices\?selected=sj-\d{2,}$/);
  }

  await page.goto("/assignments");
  await expect(page.getByRole("heading", { name: "领用分配", exact: true })).toBeVisible();
  await expect(page.getByLabel("搜索员工姓名")).toBeVisible();
  await expect(page.getByLabel("领取状态筛选")).toBeVisible();
  await expect(page.getByRole("link", { name: "审批中心" })).toHaveCount(0);
  await page.getByLabel("选择员工").selectOption(employeeCode);
  await page.getByLabel(`选择设备 ${deviceCodes[0]}`).check();
  await page.getByLabel(`选择设备 ${deviceCodes[1]}`).check();
  await Promise.all([
    page.waitForResponse((response) => response.url().includes("/api/assignments/execute") && response.request().method() === "POST" && response.status() === 201),
    page.getByRole("button", { name: "提交分配" }).click(),
  ]);

  const assignmentCards = page.getByRole("article").filter({ hasText: employeeName });
  await expect(assignmentCards).toHaveCount(1, { timeout: 15000 });
  await expect(assignmentCards.first()).toContainText(deviceCodes[0]);
  await expect(assignmentCards.first()).toContainText(deviceCodes[1]);
  const copyButton = assignmentCards.first().getByRole("button", { name: /领取确认链接/i });
  await expect(copyButton).toHaveCount(1);
  await copyButton.click();
  await expect(copyButton).toHaveText("已复制");
});
