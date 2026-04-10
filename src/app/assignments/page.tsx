import { ApprovalsFilters } from "@/components/approvals-filters";
import { ApprovalsManager } from "@/components/approvals-manager";
import { AssignmentWorkspace } from "@/components/assignment-workspace";
import { DesktopShell } from "@/components/desktop-shell";
import { PaginationNav } from "@/components/pagination-nav";
import { Panel, StatusPill } from "@/components/ui";
import { getApprovalsView } from "@/lib/approvals-view";
import { getAssignmentWorkspaceView } from "@/lib/assignment-view";
import { normalizePageParam, paginateItems } from "@/lib/pagination";

type AssignmentsPageProps = {
  searchParams?: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
};

export default async function AssignmentsPage({ searchParams }: AssignmentsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const search = params?.search?.trim() || "";
  const status = params?.status === "待领取" || params?.status === "已领取" ? params.status : "全部";
  const [{ employees, devices }, approvals] = await Promise.all([
    getAssignmentWorkspaceView(),
    getApprovalsView(),
  ]);
  const filteredApprovals = approvals.filter((item) => {
    const matchesSearch = !search || item.employeeName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "全部" || item.status === status;
    return matchesSearch && matchesStatus;
  });
  const paginated = paginateItems(filteredApprovals, normalizePageParam(params?.page), 10);
  const paginationBaseQuery = new URLSearchParams();

  if (search) {
    paginationBaseQuery.set("search", search);
  }
  if (status !== "全部") {
    paginationBaseQuery.set("status", status);
  }

  function hrefForPage(page: number) {
    const query = new URLSearchParams(paginationBaseQuery);
    if (page > 1) {
      query.set("page", String(page));
    }
    return `/assignments${query.size ? `?${query.toString()}` : ""}`;
  }

  const summary = [
    ["在职员工", String(employees.length).padStart(2, "0"), "var(--line-teal-dark)"],
    ["待分配手机", String(devices.length).padStart(2, "0"), "var(--line-aqua)"],
    ["待领取", String(approvals.filter((item) => item.status === "待领取").length).padStart(2, "0"), "var(--line-gold)"],
    ["已领取", String(approvals.filter((item) => item.status === "已领取").length).padStart(2, "0"), "var(--line-info)"],
  ];

  return (
    <main className="page-shell">
      <DesktopShell activeHref="/assignments" title="领用分配" subtitle="在同一工作台完成手机分配、员工确认链接管理和领取状态追踪">
        <Panel title="分配步骤" subtitle="选员工 -> 勾选手机 -> 生成领取链接 -> 员工确认回执" className="filters-panel">
          <div className="filters-row">
            <StatusPill tone="selected">01 选择在职员工</StatusPill>
            <StatusPill tone="selected">02 选择可分配手机</StatusPill>
            <StatusPill tone="warning">03 生成领取链接</StatusPill>
            <StatusPill tone="muted">04 员工确认</StatusPill>
          </div>
        </Panel>
        <section className="stats-grid">
          {summary.map(([label, value, accent]) => (
            <Panel key={label} className="stat-card">
              <StatusPill tone="muted">{label}</StatusPill>
              <div className="stat-card__value">{value}</div>
              <div className="stat-card__line" style={{ background: accent }} />
            </Panel>
          ))}
        </section>
        <section className="approval-page-layout">
          <AssignmentWorkspace employees={employees} devices={devices} />
          <Panel title="领取确认记录" subtitle="原审批中心内容已合并到这里，可直接筛选领取状态和回执结果" className="dashboard-panel">
            <ApprovalsFilters initialSearch={search} initialStatus={status} />
            <ApprovalsManager approvals={paginated.items} totalApprovals={filteredApprovals.length} />
            <PaginationNav
              page={paginated.page}
              totalPages={paginated.totalPages}
              totalItems={paginated.totalItems}
              pageSize={paginated.pageSize}
              hrefForPage={hrefForPage}
            />
          </Panel>
        </section>
      </DesktopShell>
    </main>
  );
}
