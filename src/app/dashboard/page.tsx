import { DesktopShell } from "@/components/desktop-shell";
import { Panel, StatusPill } from "@/components/ui";
import { getDashboardSnapshot } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

function toneForStatus(status: string) {
  if (status === "待分配") return "success";
  if (status === "已分配") return "selected";
  return "info";
}

export default async function DashboardPage() {
  const snapshot = await getDashboardSnapshot();

  return (
    <main className="page-shell">
      <DesktopShell activeHref="/dashboard" title="资产概览" subtitle={snapshot.headline}>
        <section className="stats-grid">
          {snapshot.overviewStats.map((item) => (
            <Panel key={item.label} className="stat-card">
              <StatusPill tone="muted">{item.label}</StatusPill>
              <div className="stat-card__value">{item.value}</div>
              <div className="stat-card__line" style={{ background: item.accent }} />
            </Panel>
          ))}
        </section>
        <section className="dashboard-grid">
          <Panel title="设备状态总览" subtitle="直接汇总手机资产台账中的真实状态分布" className="dashboard-panel">
            <div className="dashboard-summary-list">
              {snapshot.deviceSummary.map((item) => (
                <div key={item.label} className="dashboard-summary-item">
                  <div className="dashboard-summary-item__head">
                    <StatusPill tone={item.tone}>{item.label}</StatusPill>
                    <strong>{item.value}</strong>
                  </div>
                  <p>{item.hint}</p>
                  <i><span style={{ width: `${item.ratio * 100}%` }} /></i>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="员工状态总览" subtitle="员工管理与设备责任关系的实时汇总" className="dashboard-panel dashboard-panel--small">
            <div className="dashboard-summary-list dashboard-summary-list--compact">
              {snapshot.employeeSummary.map((item) => (
                <div key={item.label} className="dashboard-summary-item">
                  <div className="dashboard-summary-item__head">
                    <StatusPill tone={item.tone}>{item.label}</StatusPill>
                    <strong>{item.value}</strong>
                  </div>
                  <p>{item.hint}</p>
                  <i><span style={{ width: `${item.ratio * 100}%` }} /></i>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="流程待办总览" subtitle="把领用、离职回收、异常确认三条流程的待办统一拉平" className="dashboard-panel">
            <div className="dashboard-summary-list">
              {snapshot.workflowSummary.map((item) => (
                <div key={item.label} className="dashboard-summary-item">
                  <div className="dashboard-summary-item__head">
                    <StatusPill tone={item.tone}>{item.label}</StatusPill>
                    <strong>{item.value}</strong>
                  </div>
                  <p>{item.hint}</p>
                  <i><span style={{ width: `${item.ratio * 100}%` }} /></i>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="云数据库状态" subtitle="实时检测云端 MongoDB，并展示关键业务集合的当前规模" className="dashboard-panel dashboard-panel--small">
            <div className="db-status-card">
              <div className={`db-status-badge${snapshot.connectionStatus === "已连接" ? " is-online" : " is-offline"}`}>
                <span className="db-status-dot" />
                <span>{snapshot.connectionStatus}</span>
              </div>
              <p className="dashboard-note">当前仪表盘已直接读取云数据库集合统计、最近手机资产和最新变动事件。</p>
            </div>
            <div className="db-collection-grid">
              {snapshot.collectionCounts.map((item) => (
                <div key={item.label} className="db-collection-card">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
            <div className="db-latest-list">
              {snapshot.latestDevices.length ? snapshot.latestDevices.map((item) => (
                <div key={item.code} className="db-latest-item">
                  <div>
                    <strong>{item.code}</strong>
                    <p>{item.title}</p>
                    <p>所在地：{item.location}</p>
                  </div>
                  <StatusPill tone={toneForStatus(item.status)}>{item.status}</StatusPill>
                </div>
              )) : <div className="db-empty">当前云数据库中暂无手机资产数据。</div>}
            </div>
          </Panel>
          <Panel title="最近资产变动" subtitle="按设备事件时间倒序展示最近发生的真实动作" className="dashboard-panel dashboard-panel--wide">
            <div className="dashboard-activity-list">
              {snapshot.recentActivities.length ? snapshot.recentActivities.map((item, index) => (
                <div key={`${item.title}-${index}`} className="dashboard-activity-item">
                  <StatusPill tone={item.tone}>{item.title}</StatusPill>
                  <p>{item.meta}</p>
                </div>
              )) : <div className="db-empty">当前还没有可展示的资产变动记录。</div>}
            </div>
          </Panel>
        </section>
      </DesktopShell>
    </main>
  );
}
