import { DesktopShell } from "@/components/desktop-shell";
import { ExchangeWorkspace } from "@/components/exchange-workspace";
import { StatusPill } from "@/components/ui";
import { getExchangeWorkspaceView } from "@/lib/exchange-view";

export const dynamic = "force-dynamic";

export default async function ExchangePage() {
  const { employees, summary } = await getExchangeWorkspaceView();

  return (
    <main className="page-shell">
      <DesktopShell activeHref="/exchange" title="相互交换" subtitle="在两名在职员工之间直接交换已领取手机，并同步更正责任归属">
        <section className="stats-grid stats-grid--three">
          <div className="panel stat-card">
            <StatusPill tone="selected">可交换员工</StatusPill>
            <div className="stat-card__value">{String(summary.employeeCount).padStart(2, "0")}</div>
            <div className="stat-card__line" style={{ background: "var(--line-teal-dark)" }} />
          </div>
          <div className="panel stat-card">
            <StatusPill tone="info">可交换手机</StatusPill>
            <div className="stat-card__value">{String(summary.deviceCount).padStart(2, "0")}</div>
            <div className="stat-card__line" style={{ background: "var(--line-info)" }} />
          </div>
          <div className="panel stat-card">
            <StatusPill tone="warning">执行方式</StatusPill>
            <div className="stat-card__value">双向</div>
            <div className="stat-card__line" style={{ background: "var(--line-gold)" }} />
          </div>
        </section>
        <ExchangeWorkspace employees={employees} />
      </DesktopShell>
    </main>
  );
}
