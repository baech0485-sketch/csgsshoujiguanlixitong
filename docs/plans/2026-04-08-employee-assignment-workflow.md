# 员工分配与离职回收流程 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 建立“员工管理驱动的手机分配、审批确认、员工签字领取、离职回收签字、手机回库待分配”的完整代码闭环。

**Architecture:** 以 MongoDB 为中心，新增 `employees` 集合，重构 `approvals` 和 `offboarding` 的业务字段；后台页面全部改为服务端读取真实数据，移动端通过 `token` 访问确认页面并写回签字结果。优先复用现有 `devices`、`approvals`、`offboarding` 页面壳层，新增独立的数据层与输入校验模块，避免继续把全部逻辑堆进单个文件。

**Tech Stack:** Next.js 16 App Router、TypeScript、MongoDB Node Driver、Vitest、Playwright

---

### Task 1: 定义员工数据层

**Files:**
- Create: `src/lib/employee-input.ts`
- Create: `src/lib/employee-data.ts`
- Modify: `src/lib/mongodb.ts`
- Test: `tests/unit/employee-input.spec.ts`

**Step 1: 写失败测试**

覆盖：
- 员工编号、姓名、部门必填
- 状态只能是 `在职` 或 `离职`
- 默认状态为 `在职`

**Step 2: 运行测试确认失败**

Run: `npm test -- --run tests/unit/employee-input.spec.ts`

**Step 3: 实现最小代码**

- 新增员工输入规范化
- 新增员工集合访问
- 新增员工列表读取方法

**Step 4: 再跑测试**

Run: `npm test -- --run tests/unit/employee-input.spec.ts`

### Task 2: 实现员工管理 API

**Files:**
- Create: `src/app/api/employees/route.ts`
- Create: `src/app/api/employees/[employeeCode]/route.ts`
- Create: `src/lib/employee-patch.ts`
- Test: `tests/unit/employee-patch.spec.ts`

**Step 1: 写失败测试**

覆盖：
- 只能更新允许字段
- 状态切换合法
- 不允许写空姓名和空部门

**Step 2: 运行测试确认失败**

Run: `npm test -- --run tests/unit/employee-patch.spec.ts`

**Step 3: 实现最小代码**

- `GET /api/employees`
- `POST /api/employees`
- `PATCH /api/employees/[employeeCode]`

**Step 4: 再跑测试**

Run: `npm test -- --run tests/unit/employee-patch.spec.ts`

### Task 3: 实现员工管理页面

**Files:**
- Create: `src/app/employees/page.tsx`
- Create: `src/components/employees-manager.tsx`
- Modify: `src/components/desktop-shell.tsx`
- Modify: `src/lib/tokens.ts`
- Modify: `src/app/desktop.css`
- Test: `tests/e2e/employees-page.spec.ts`

**Step 1: 先写 E2E**

覆盖：
- 可新增员工
- 列表显示新增员工
- 在职/离职状态可切换

**Step 2: 运行确认失败**

Run: `npm run test:e2e -- tests/e2e/employees-page.spec.ts`

**Step 3: 实现页面**

- 新导航顺序
- 列表、搜索、状态切换
- 新增员工表单

**Step 4: 再跑 E2E**

Run: `npm run test:e2e -- tests/e2e/employees-page.spec.ts`

### Task 4: 重构领用分配输入模型

**Files:**
- Create: `src/lib/assignment-input.ts`
- Create: `src/lib/workflow-links.ts`
- Test: `tests/unit/assignment-input.spec.ts`

**Step 1: 写失败测试**

覆盖：
- 设备编号、员工编号必填
- 生成 `confirmToken`
- 生成 `confirmUrl`

**Step 2: 运行确认失败**

Run: `npm test -- --run tests/unit/assignment-input.spec.ts`

**Step 3: 实现最小代码**

- 规范化分配输入
- 统一生成领取确认链接

**Step 4: 再跑测试**

Run: `npm test -- --run tests/unit/assignment-input.spec.ts`

### Task 5: 重构领用分配 API

**Files:**
- Modify: `src/app/api/assignments/execute/route.ts`
- Create: `src/lib/assignment-service.ts`
- Modify: `src/lib/device-events.ts`
- Test: `tests/unit/assignment-service.spec.ts`

**Step 1: 写失败测试**

覆盖：
- 只能分配给 `在职` 员工
- 设备来源只能是 `在库` 或 `待分配`
- 创建审批记录并生成确认链接
- 设备状态变为 `待领取`

**Step 2: 运行确认失败**

Run: `npm test -- --run tests/unit/assignment-service.spec.ts`

**Step 3: 实现最小代码**

- 查询员工与设备
- 更新设备责任人
- 写入审批记录
- 记录设备事件

**Step 4: 再跑测试**

Run: `npm test -- --run tests/unit/assignment-service.spec.ts`

### Task 6: 重构领用分配页面

**Files:**
- Modify: `src/app/assignments/page.tsx`
- Modify: `src/components/assignment-workspace.tsx`
- Create: `src/lib/assignment-view.ts`
- Modify: `src/app/desktop.css`
- Test: `tests/e2e/assignments-page.spec.ts`

**Step 1: 写失败 E2E**

覆盖：
- 页面从员工管理读取在职员工
- 页面只显示可分配设备
- 分配成功后出现确认链接

**Step 2: 运行确认失败**

Run: `npm run test:e2e -- tests/e2e/assignments-page.spec.ts`

**Step 3: 实现页面**

- 左侧选设备
- 右侧选员工并提交
- 成功后显示链接与状态

**Step 4: 再跑 E2E**

Run: `npm run test:e2e -- tests/e2e/assignments-page.spec.ts`

### Task 7: 重构审批中心

**Files:**
- Modify: `src/lib/workflow-data.ts`
- Modify: `src/app/approvals/page.tsx`
- Modify: `src/components/approvals-manager.tsx`
- Modify: `src/app/api/approvals/route.ts`
- Modify: `src/app/api/approvals/[id]/route.ts`
- Test: `tests/e2e/approvals-page.spec.ts`

**Step 1: 写失败 E2E**

覆盖：
- 可看到分配生成的审批记录
- 可看到确认链接
- 员工签字后可看到签字时间与签字状态

**Step 2: 运行确认失败**

Run: `npm run test:e2e -- tests/e2e/approvals-page.spec.ts`

**Step 3: 实现页面**

- 将审批中心主视图切换为分配确认流
- 展示签字结果与设备信息

**Step 4: 再跑 E2E**

Run: `npm run test:e2e -- tests/e2e/approvals-page.spec.ts`

### Task 8: 实现签字组件与领取确认页

**Files:**
- Create: `src/components/signature-pad.tsx`
- Modify: `src/app/m/receipt-confirm/page.tsx`
- Modify: `src/components/receipt-confirm-action.tsx`
- Modify: `src/app/api/workflows/receipt-confirm/route.ts`
- Create: `src/lib/receipt-confirm-input.ts`
- Test: `tests/unit/receipt-confirm-input.spec.ts`
- Test: `tests/e2e/receipt-confirm.spec.ts`

**Step 1: 先写失败测试**

覆盖：
- 必须有 `token`
- 必须勾选确认项
- 必须有签字图片

**Step 2: 运行确认失败**

Run: `npm test -- --run tests/unit/receipt-confirm-input.spec.ts`
Run: `npm run test:e2e -- tests/e2e/receipt-confirm.spec.ts`

**Step 3: 实现页面与 API**

- 通过 `token` 读取审批记录
- 员工签字并确认
- 写入签字图、签字时间
- 设备改为 `使用中`
- 审批状态改为 `已领取`

**Step 4: 再跑测试**

Run: `npm test -- --run tests/unit/receipt-confirm-input.spec.ts`
Run: `npm run test:e2e -- tests/e2e/receipt-confirm.spec.ts`

### Task 9: 重构离职回收 API 与页面

**Files:**
- Modify: `src/lib/workflow-input.ts`
- Modify: `src/app/api/offboarding/route.ts`
- Modify: `src/app/api/offboarding/[employeeName]/route.ts`
- Modify: `src/app/offboarding/page.tsx`
- Modify: `src/components/offboarding-manager.tsx`
- Create: `src/lib/offboarding-view.ts`
- Test: `tests/e2e/offboarding-page.spec.ts`

**Step 1: 先写失败 E2E**

覆盖：
- 选择员工后自动带出其名下全部设备
- 发起回收后展示归还链接
- 发起后设备状态改为 `待回收`

**Step 2: 运行确认失败**

Run: `npm run test:e2e -- tests/e2e/offboarding-page.spec.ts`

**Step 3: 实现页面与 API**

- 从员工维度发起回收
- 存储设备快照、确认链接
- 展示状态、链接、签字状态

**Step 4: 再跑 E2E**

Run: `npm run test:e2e -- tests/e2e/offboarding-page.spec.ts`

### Task 10: 实现离职归还签字确认页

**Files:**
- Modify: `src/app/m/return-confirm/page.tsx`
- Modify: `src/components/return-confirm-action.tsx`
- Modify: `src/app/api/workflows/return-confirm/route.ts`
- Create: `src/lib/return-confirm-input.ts`
- Test: `tests/unit/return-confirm-input.spec.ts`
- Test: `tests/e2e/return-confirm.spec.ts`

**Step 1: 先写失败测试**

覆盖：
- 必须携带 `token`
- 必须签字
- 一次性回收当前单据的全部设备

**Step 2: 运行确认失败**

Run: `npm test -- --run tests/unit/return-confirm-input.spec.ts`
Run: `npm run test:e2e -- tests/e2e/return-confirm.spec.ts`

**Step 3: 实现页面与 API**

- 通过 `token` 读取离职回收单
- 提交签字
- 所有设备状态改为 `待分配`
- 员工状态改为 `离职`
- 回收单状态改为 `已回收`

**Step 4: 再跑测试**

Run: `npm test -- --run tests/unit/return-confirm-input.spec.ts`
Run: `npm run test:e2e -- tests/e2e/return-confirm.spec.ts`

### Task 11: 联调与收尾

**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/lib/dashboard-data.ts`
- Modify: `tests/e2e/auth-flow.spec.ts`
- Modify: `tests/e2e/app-shell.spec.ts`

**Step 1: 调整仪表盘摘要**

- 增加员工数、待领取数、待回收数

**Step 2: 更新全局导航与链接落点**

- 新增员工管理入口
- 调整领用分配与审批中心顺序

**Step 3: 全量验证**

Run: `npm test`
Run: `npm run lint`
Run: `npm run build`
Run: `npm run test:e2e`

**Step 4: 记录结果**

- 若测试数据写入云库，清理本轮测试记录
