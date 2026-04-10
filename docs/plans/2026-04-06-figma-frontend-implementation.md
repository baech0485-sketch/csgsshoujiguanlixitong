# 呈尚策划公司手机管理系统前端 Figma 落地实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将当前 Figma 中的后台端与销售 H5 设计一比一落地为可运行的前端项目代码，并保留统一的设计变量、图标和页面结构。

**Architecture:** 使用 Next.js App Router 构建单仓前端工程，桌面端后台与移动端 H5 共用同一套设计令牌、图标组件和基础 UI 组件。样式采用原生 CSS Modules + 全局 design tokens，不引入 Tailwind，确保与 Figma 的配色、间距、圆角和阴影保持 1:1 对齐。

**Tech Stack:** Next.js、React、TypeScript、CSS Modules、ESLint、Playwright、Vitest

---

### Task 1: 初始化前端工程与开发依赖

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/styles/globals.css`
- Test: `tests/e2e/app-shell.spec.ts`

**Step 1: Write the failing test**

```ts
import { test, expect } from "@playwright/test";

test("应用根页面应能正常打开", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/app-shell.spec.ts`
Expected: FAIL，提示应用尚未初始化或根页面不存在

**Step 3: Write minimal implementation**

```tsx
export default function HomePage() {
  return <main>呈尚策划公司手机管理系统</main>;
}
```

**Step 4: Run test to verify it passes**

Run: `npm run dev` 后执行 `npx playwright test tests/e2e/app-shell.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: 初始化前端工程骨架"
```

### Task 2: 建立设计令牌、字体与图标基线

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/reset.css`
- Create: `src/components/icons/*.tsx`
- Create: `src/components/icons/index.ts`
- Test: `tests/unit/design-tokens.spec.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { colorTokens } from "@/components/theme/tokens";

describe("design tokens", () => {
  it("应暴露 Figma 中的核心颜色令牌", () => {
    expect(colorTokens.primarySurface).toBe("#103C43");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest tests/unit/design-tokens.spec.ts`
Expected: FAIL，提示令牌模块不存在

**Step 3: Write minimal implementation**

```ts
export const colorTokens = {
  primarySurface: "#103C43",
};
```

**Step 4: Run test to verify it passes**

Run: `npx vitest tests/unit/design-tokens.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src tests
git commit -m "feat: 建立前端设计令牌与图标基线"
```

### Task 3: 实现后台壳层与桌面端导航框架

**Files:**
- Create: `src/components/layout/desktop-shell.tsx`
- Create: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/topbar.tsx`
- Create: `src/app/(desktop)/layout.tsx`
- Test: `tests/e2e/desktop-shell.spec.ts`

**Step 1: Write the failing test**

```ts
import { test, expect } from "@playwright/test";

test("桌面端页面应显示侧边栏与顶栏", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByText("呈尚策划")).toBeVisible();
  await expect(page.getByText("资产概览")).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/desktop-shell.spec.ts`
Expected: FAIL，提示页面不存在

**Step 3: Write minimal implementation**

```tsx
export default function DashboardPage() {
  return <main>资产概览</main>;
}
```

**Step 4: Run test to verify it passes**

Run: `npm run dev` 后执行 `npx playwright test tests/e2e/desktop-shell.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src tests
git commit -m "feat: 实现后台端导航壳层"
```

### Task 4: 落地后台核心页面第一批

**Files:**
- Create: `src/app/(desktop)/login/page.tsx`
- Create: `src/app/(desktop)/dashboard/page.tsx`
- Create: `src/app/(desktop)/devices/page.tsx`
- Create: `src/app/(desktop)/devices/modal-demo/page.tsx`
- Test: `tests/e2e/desktop-core-pages.spec.ts`

**Step 1: Write the failing test**

```ts
import { test, expect } from "@playwright/test";

test("手机资产台账页应显示录入按钮", async ({ page }) => {
  await page.goto("/devices");
  await expect(page.getByRole("button", { name: "手机录入" })).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/desktop-core-pages.spec.ts`
Expected: FAIL，提示录入按钮不存在

**Step 3: Write minimal implementation**

```tsx
export default function DevicesPage() {
  return <button>手机录入</button>;
}
```

**Step 4: Run test to verify it passes**

Run: `npm run dev` 后执行 `npx playwright test tests/e2e/desktop-core-pages.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src tests
git commit -m "feat: 落地后台核心页面第一批"
```

### Task 5: 落地后台核心页面第二批

**Files:**
- Create: `src/app/(desktop)/approvals/page.tsx`
- Create: `src/app/(desktop)/assignments/page.tsx`
- Create: `src/app/(desktop)/offboarding/page.tsx`
- Create: `src/app/(desktop)/incidents/page.tsx`
- Create: `src/app/(desktop)/devices/[id]/page.tsx`
- Test: `tests/e2e/desktop-workflows.spec.ts`

**Step 1: Write the failing test**

```ts
import { test, expect } from "@playwright/test";

test("审批中心应显示审批队列", async ({ page }) => {
  await page.goto("/approvals");
  await expect(page.getByText("审批队列")).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/desktop-workflows.spec.ts`
Expected: FAIL，提示审批中心未实现

**Step 3: Write minimal implementation**

```tsx
export default function ApprovalsPage() {
  return <main>审批队列</main>;
}
```

**Step 4: Run test to verify it passes**

Run: `npm run dev` 后执行 `npx playwright test tests/e2e/desktop-workflows.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src tests
git commit -m "feat: 落地后台核心页面第二批"
```

### Task 6: 落地销售 H5 页面与移动交互

**Files:**
- Create: `src/app/(mobile)/layout.tsx`
- Create: `src/app/(mobile)/my-devices/page.tsx`
- Create: `src/app/(mobile)/receipt-confirm/page.tsx`
- Create: `src/app/(mobile)/return-confirm/page.tsx`
- Create: `src/app/(mobile)/incident-report/page.tsx`
- Create: `src/app/(mobile)/my-records/page.tsx`
- Test: `tests/e2e/mobile-pages.spec.ts`

**Step 1: Write the failing test**

```ts
import { test, expect } from "@playwright/test";

test("移动端我的手机页应显示进入确认流程按钮", async ({ page }) => {
  await page.goto("/m/my-devices");
  await expect(page.getByRole("button", { name: "进入确认流程" })).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/mobile-pages.spec.ts`
Expected: FAIL，提示移动端页面不存在

**Step 3: Write minimal implementation**

```tsx
export default function MyDevicesPage() {
  return <button>进入确认流程</button>;
}
```

**Step 4: Run test to verify it passes**

Run: `npm run dev` 后执行 `npx playwright test tests/e2e/mobile-pages.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src tests
git commit -m "feat: 落地销售 H5 页面"
```

### Task 7: 联调、细节校准与验证

**Files:**
- Modify: `README.md`
- Modify: `src/**/*`
- Test: `tests/e2e/*.spec.ts`
- Test: `tests/unit/*.spec.ts`

**Step 1: Write the failing test**

```ts
import { test, expect } from "@playwright/test";

test("关键桌面端与移动端页面应全部可访问", async ({ page }) => {
  for (const path of ["/login", "/dashboard", "/devices", "/approvals", "/m/my-devices"]) {
    await page.goto(path);
    await expect(page.locator("body")).toBeVisible();
  }
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test`
Expected: FAIL，提示至少一个页面未实现或视觉结构异常

**Step 3: Write minimal implementation**

```tsx
// 修正缺失页面、布局和组件细节，确保所有入口均可访问
```

**Step 4: Run test to verify it passes**

Run: `npm run lint && npx vitest && npx playwright test`
Expected: 全部 PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: 完成 Figma UI 前端落地与验证"
```
