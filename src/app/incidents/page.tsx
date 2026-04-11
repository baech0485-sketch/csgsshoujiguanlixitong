import { DesktopShell } from "@/components/desktop-shell";
import { IncidentRepairDialog } from "@/components/incident-repair-dialog";
import { IncidentRecordList } from "@/components/incident-record-list";
import { IncidentWorkspace } from "@/components/incident-workspace";
import { PaginationNav } from "@/components/pagination-nav";
import { Panel, StatusPill } from "@/components/ui";
import { getIncidentWorkspaceView } from "@/lib/incident-management";
import { normalizePageParam } from "@/lib/pagination";

type IncidentsPageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

export default async function IncidentsPage({ searchParams }: IncidentsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const { employees, records, repairQueue, summary, pagination } = await getIncidentWorkspaceView(
    normalizePageParam(params?.page),
    10,
  );

  return (
    <main className="page-shell">
      <DesktopShell activeHref="/incidents" title="异常管理" subtitle="管理员代员工发起异常确认链接，员工确认后手机自动转入维修中并同步到员工管理">
        <section className="stats-grid stats-grid--three">
          {[
            ["待员工确认", String(summary.pending).padStart(2, "0"), "var(--line-danger)"],
            ["维修中", String(summary.repairing).padStart(2, "0"), "var(--line-info)"],
            ["丢失申报", String(summary.lost).padStart(2, "0"), "var(--line-gold)"],
          ].map(([label, value, accent]) => (
            <Panel key={String(label)} className="stat-card">
              <StatusPill tone="muted">{label}</StatusPill><div className="stat-card__value">{value}</div><div className="stat-card__line" style={{ background: String(accent) }} />
            </Panel>
          ))}
        </section>
        <div className="incident-page-actions">
          <IncidentRepairDialog items={repairQueue} />
        </div>
        <section className="approval-page-layout">
          <IncidentWorkspace employees={employees} />
          <Panel title="异常确认记录" subtitle="保留所有异常确认与处理结果，方便后续追溯和复盘。">
            <IncidentRecordList records={records} totalRecords={pagination.totalItems} />
          </Panel>
        </section>
        <PaginationNav
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          hrefForPage={(page) => `/incidents${page > 1 ? `?page=${page}` : ""}`}
        />
      </DesktopShell>
    </main>
  );
}
