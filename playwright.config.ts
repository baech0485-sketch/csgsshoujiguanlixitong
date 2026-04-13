import { defineConfig, devices } from "@playwright/test";

if (process.env.E2E_USE_MEMORY_MONGO !== "1") {
  throw new Error("Playwright 已禁止直连默认数据库。请使用 `npm run test:e2e` 启动内存测试库。");
}

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  fullyParallel: false,
  workers: 1,
  webServer: {
    command: "npm run start",
    port: 3000,
    reuseExistingServer: false,
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
