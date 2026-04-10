# 列表分页 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为手机资产、员工管理、领用分配、审批中心、离职回收这 5 个增长型列表统一加入分页，每页固定显示 10 条。

**Architecture:** 采用服务端基于查询参数 `page` 的轻量分页方案，统一由一个分页工具函数和一个分页导航组件复用。当前列表总量不大，先在服务端取回已有结果后再做内存分页，优先最小改动落地，不引入额外复杂查询协议。

**Tech Stack:** Next.js 16 App Router、TypeScript、MongoDB Node Driver、Vitest、Playwright

---

### Task 1: 分页工具

**Files:**
- Create: `src/lib/pagination.ts`
- Test: `tests/unit/pagination.spec.ts`

**Step 1: 写失败测试**

- 非法页码回退到第 1 页
- 总页数计算正确
- 每页 10 条切片正确

**Step 2: 跑失败测试**

Run: `npm test -- --run tests/unit/pagination.spec.ts`

**Step 3: 实现最小工具**

- `normalizePage`
- `paginateItems`

**Step 4: 跑通过**

Run: `npm test -- --run tests/unit/pagination.spec.ts`

### Task 2: 分页组件

**Files:**
- Create: `src/components/pagination-nav.tsx`
- Modify: `src/app/desktop.css`

**Step 1: 实现统一分页导航**

- 上一页 / 下一页
- 页码显示
- 当前页高亮
- 保留原筛选查询参数

### Task 3: 接入 5 个页面

**Files:**
- Modify: `src/app/devices/page.tsx`
- Modify: `src/app/employees/page.tsx`
- Modify: `src/components/employees-manager.tsx`
- Modify: `src/app/assignments/page.tsx`
- Modify: `src/components/assignment-workspace.tsx`
- Modify: `src/app/approvals/page.tsx`
- Modify: `src/components/approvals-manager.tsx`
- Modify: `src/app/offboarding/page.tsx`
- Modify: `src/components/offboarding-manager.tsx`

**Step 1: 设备列表分页**

- 只分页设备列表
- 右侧设备速览不参与分页高度增长

**Step 2: 员工台账分页**

- 列表每页 10 条
- 搜索条件切页保持

**Step 3: 最近分配记录分页**

- 只分页右侧最近分配记录

**Step 4: 分配确认记录分页**

- 审批中心记录每页 10 条

**Step 5: 离职回收记录分页**

- 只分页回收单列表

### Task 4: 全量验证

**Files:**
- Modify if needed: `tests/e2e/*`

**Step 1: 跑验证**

Run: `npm test`
Run: `npm run lint`
Run: `npm run build`
Run: `npm run test:e2e`
