# 呈尚策划公司手机管理系统实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建一个支持手机资产全生命周期追溯、销售领取确认、离职归还和再次分配的内部管理系统。

**Architecture:** 使用 Next.js 15 单仓实现后台管理端与销售 H5，两端共享同一套权限、业务规则和 API。云端 MongoDB 中的 `shoujiguanli` 数据库存储资产台账、审批单、领用流水和审计记录，Prisma 负责 MongoDB 数据建模访问，服务端统一校验状态流转并写入审计日志。

**Tech Stack:** Next.js 15、TypeScript、MongoDB、Prisma、Ant Design、Zod、Vitest、Playwright

---

### Task 1: 初始化项目骨架与质量基线

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/login/page.tsx`
- Create: `src/styles/globals.css`
- Create: `tests/e2e/login-shell.spec.ts`

**Step 1: Write the failing test**

```ts
import { test, expect } from "@playwright/test";

test("登录页应显示系统名称和登录表单", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("呈尚策划公司手机管理系统")).toBeVisible();
  await expect(page.getByRole("button", { name: "登录" })).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm playwright test tests/e2e/login-shell.spec.ts`
Expected: FAIL，提示应用未启动或页面元素不存在

**Step 3: Write minimal implementation**

```tsx
export default function LoginPage() {
  return (
    <main>
      <h1>呈尚策划公司手机管理系统</h1>
      <form>
        <input placeholder="账号" />
        <input placeholder="密码" type="password" />
        <button type="submit">登录</button>
      </form>
    </main>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm dev` 后执行 `pnpm playwright test tests/e2e/login-shell.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: 初始化手机管理系统基础工程"
```

### Task 2: 建立核心数据模型与数据库迁移

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/db.ts`
- Create: `src/lib/constants/device-status.ts`
- Create: `.env.example`
- Create: `tests/server/device-schema.spec.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { DEVICE_STATUS } from "@/lib/constants/device-status";

describe("手机状态定义", () => {
  it("应包含领用闭环所需状态", () => {
    expect(DEVICE_STATUS).toEqual([
      "在库",
      "待领取",
      "使用中",
      "待归还",
      "维修中",
      "丢失",
      "已报废",
      "已封存",
    ]);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/server/device-schema.spec.ts`
Expected: FAIL，提示常量或模块不存在

**Step 3: Write minimal implementation**

```ts
export const DEVICE_STATUS = [
  "在库",
  "待领取",
  "使用中",
  "待归还",
  "维修中",
  "丢失",
  "已报废",
  "已封存",
] as const;
```

```prisma
datasource db {
  provider = "mongodb"
  url      = env("MONGODB_URI")
}

model Device {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  assetCode       String   @unique
  brand           String
  model           String
  imei1           String   @unique
  imei2           String?
  serialNumber    String?  @unique
  status          String
  currentHolderId String?  @db.ObjectId
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

```env
MONGODB_URI=<包含 shoujiguanli 数据库名的云端连接串>
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest tests/server/device-schema.spec.ts && pnpm prisma db push`
Expected: PASS，MongoDB 模型同步成功

**Step 5: Commit**

```bash
git add prisma src tests .env.example
git commit -m "feat: 建立手机资产核心数据模型"
```

### Task 3: 实现账号登录与角色权限

**Files:**
- Create: `src/lib/auth/session.ts`
- Create: `src/lib/auth/roles.ts`
- Create: `src/middleware.ts`
- Create: `src/app/(admin)/layout.tsx`
- Create: `tests/server/roles.spec.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { canAccess } from "@/lib/auth/roles";

describe("角色权限", () => {
  it("销售不能访问后台资产管理菜单", () => {
    expect(canAccess("销售", "devices:manage")).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/server/roles.spec.ts`
Expected: FAIL，提示权限函数不存在

**Step 3: Write minimal implementation**

```ts
const rolePermissions: Record<string, string[]> = {
  系统管理员: ["*"],
  资产管理员: ["devices:manage", "assignments:manage", "approvals:execute", "reports:view"],
  销售主管: ["team:view", "assignments:view", "approvals:approve"],
  销售: ["self:view", "self:confirm", "approvals:create"],
};

export function canAccess(role: string, permission: string) {
  const permissions = rolePermissions[role] ?? [];
  return permissions.includes("*") || permissions.includes(permission);
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest tests/server/roles.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src tests
git commit -m "feat: 实现系统角色与权限控制"
```

### Task 4: 实现手机资产台账列表与详情

**Files:**
- Create: `src/app/(admin)/devices/page.tsx`
- Create: `src/app/(admin)/devices/[id]/page.tsx`
- Create: `src/components/devices/device-table.tsx`
- Create: `src/components/devices/device-filters.tsx`
- Create: `src/app/api/devices/route.ts`
- Create: `tests/e2e/device-list.spec.ts`

**Step 1: Write the failing test**

```ts
import { test, expect } from "@playwright/test";

test("资产管理员应能看到手机台账列表", async ({ page }) => {
  await page.goto("/devices");
  await expect(page.getByRole("heading", { name: "手机资产台账" })).toBeVisible();
  await expect(page.getByPlaceholder("搜索资产编号/IMEI/责任人")).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm playwright test tests/e2e/device-list.spec.ts`
Expected: FAIL，提示页面不存在

**Step 3: Write minimal implementation**

```tsx
export default function DevicesPage() {
  return (
    <section>
      <h1>手机资产台账</h1>
      <input placeholder="搜索资产编号/IMEI/责任人" />
    </section>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm playwright test tests/e2e/device-list.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src tests
git commit -m "feat: 实现手机资产台账页面"
```

### Task 5: 实现审批单模型与审批中心

**Files:**
- Create: `src/app/(admin)/approvals/page.tsx`
- Create: `src/app/api/approvals/route.ts`
- Create: `src/lib/domain/approvals.ts`
- Create: `src/lib/constants/approval-types.ts`
- Create: `tests/server/approval-flow.spec.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { getNextApprovalNode } from "@/lib/domain/approvals";

describe("标准审批流", () => {
  it("领用申请在主管审批后应进入资产管理员执行节点", () => {
    expect(getNextApprovalNode("领用申请", "销售主管审批")).toBe("资产管理员执行");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/server/approval-flow.spec.ts`
Expected: FAIL，提示审批流函数不存在

**Step 3: Write minimal implementation**

```ts
export function getNextApprovalNode(type: string, currentNode: string) {
  if (type === "领用申请" && currentNode === "销售主管审批") {
    return "资产管理员执行";
  }
  throw new Error("未定义的审批流转");
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest tests/server/approval-flow.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src tests
git commit -m "feat: 实现审批中心与标准审批流"
```

### Task 6: 实现分配申请、审批与领取确认流程

**Files:**
- Create: `src/app/(admin)/assignments/page.tsx`
- Create: `src/app/api/assignments/route.ts`
- Create: `src/app/(mobile)/my-devices/page.tsx`
- Create: `src/app/api/my-devices/confirm-receipt/route.ts`
- Create: `tests/server/assignment-flow.spec.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { nextStatusAfterAssign } from "@/lib/domain/device-flow";

describe("分配流程", () => {
  it("在库手机分配后应进入待领取状态", () => {
    expect(nextStatusAfterAssign("在库")).toBe("待领取");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/server/assignment-flow.spec.ts`
Expected: FAIL，提示状态流转函数不存在

**Step 3: Write minimal implementation**

```ts
export function nextStatusAfterAssign(status: string) {
  if (status !== "在库") {
    throw new Error("只有在库手机才能被分配");
  }
  return "待领取";
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest tests/server/assignment-flow.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src tests
git commit -m "feat: 实现手机分配与领取确认流程"
```

### Task 7: 实现归还、离职回收与再分配流程

**Files:**
- Create: `src/app/(admin)/returns/page.tsx`
- Create: `src/app/(admin)/offboarding/page.tsx`
- Create: `src/app/api/returns/route.ts`
- Create: `src/app/api/offboarding/route.ts`
- Create: `tests/server/offboarding-flow.spec.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { canFinishOffboarding } from "@/lib/domain/offboarding";

describe("离职回收流程", () => {
  it("员工存在使用中手机时不能完成离职", () => {
    expect(canFinishOffboarding([{ status: "使用中" }])).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/server/offboarding-flow.spec.ts`
Expected: FAIL，提示离职规则函数不存在

**Step 3: Write minimal implementation**

```ts
export function canFinishOffboarding(devices: Array<{ status: string }>) {
  return devices.every((device) => device.status !== "使用中");
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest tests/server/offboarding-flow.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src tests
git commit -m "feat: 实现离职回收与再分配规则"
```

### Task 8: 实现异常处理与状态闭环

**Files:**
- Create: `src/app/(admin)/incidents/page.tsx`
- Create: `src/app/api/incidents/route.ts`
- Create: `src/lib/domain/incidents.ts`
- Create: `tests/server/incidents.spec.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { nextStatusAfterLostReport } from "@/lib/domain/incidents";

describe("异常处理", () => {
  it("丢失上报后设备状态应改为丢失", () => {
    expect(nextStatusAfterLostReport("使用中")).toBe("丢失");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/server/incidents.spec.ts`
Expected: FAIL，提示异常处理函数不存在

**Step 3: Write minimal implementation**

```ts
export function nextStatusAfterLostReport(status: string) {
  if (status !== "使用中") {
    throw new Error("只有使用中的手机才能登记丢失");
  }
  return "丢失";
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest tests/server/incidents.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src tests
git commit -m "feat: 实现异常处理状态流转"
```

### Task 9: 实现追溯时间线、报表和预警

**Files:**
- Create: `src/app/(admin)/dashboard/page.tsx`
- Create: `src/app/(admin)/devices/[id]/timeline/page.tsx`
- Create: `src/app/api/reports/summary/route.ts`
- Create: `src/app/api/reports/offboarding/route.ts`
- Create: `tests/e2e/dashboard.spec.ts`

**Step 1: Write the failing test**

```ts
import { test, expect } from "@playwright/test";

test("仪表盘应显示待归还和丢失统计", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByText("待归还手机")).toBeVisible();
  await expect(page.getByText("丢失手机")).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm playwright test tests/e2e/dashboard.spec.ts`
Expected: FAIL，提示页面不存在

**Step 3: Write minimal implementation**

```tsx
export default function DashboardPage() {
  return (
    <section>
      <h1>资产概览</h1>
      <div>待归还手机</div>
      <div>丢失手机</div>
    </section>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm playwright test tests/e2e/dashboard.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src tests
git commit -m "feat: 实现资产追溯报表与预警"
```

### Task 10: 完成销售 H5、自测和上线准备

**Files:**
- Create: `src/app/(mobile)/layout.tsx`
- Create: `src/app/(mobile)/my-devices/page.tsx`
- Create: `src/app/(mobile)/my-records/page.tsx`
- Create: `src/lib/validators/device.ts`
- Create: `README.md`
- Create: `tests/e2e/mobile-self-service.spec.ts`

**Step 1: Write the failing test**

```ts
import { test, expect } from "@playwright/test";

test("销售应能在移动端查看自己的手机和历史记录", async ({ page }) => {
  await page.goto("/my-devices");
  await expect(page.getByText("我的手机")).toBeVisible();
  await expect(page.getByText("历史记录")).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm playwright test tests/e2e/mobile-self-service.spec.ts`
Expected: FAIL，提示页面不存在

**Step 3: Write minimal implementation**

```tsx
export default function MyDevicesPage() {
  return (
    <main>
      <h1>我的手机</h1>
      <section>历史记录</section>
    </main>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm playwright test tests/e2e/mobile-self-service.spec.ts`
Expected: PASS，然后执行 `pnpm lint && pnpm vitest && pnpm playwright test`

**Step 5: Commit**

```bash
git add .
git commit -m "feat: 完成销售端自助能力与上线准备"
```

## 交付清单

- 后台管理端
- 销售 H5
- 数据库模型与迁移脚本
- 权限控制
- 审批中心
- 资产台账
- 分配、归还、调拨、维修、报废流程
- 追溯时间线与报表
- 自动化测试
- 部署说明

## 风险与控制

- 风险：员工信息来源不统一
  控制：第一期允许 Excel 导入，第二期再接人事系统

- 风险：审批链过长导致执行效率下降
  控制：第一期固定为“标准审批”而不是全量重审批，并保留后续配置能力

- 风险：旧手机历史记录缺失
  控制：提供“期初导入”模式，并标记历史数据来源

- 风险：业务流程先于制度
  控制：上线前先同步“分配必须确认、离职必须归还”的管理制度

## 建议执行顺序

先做 Task 1-5，拿到“可登录、可建档、可查台账、可审批”的基础版本；再做 Task 6-8，跑通资产闭环；最后做 Task 9-10，完善管理视图、移动端和上线准备。
