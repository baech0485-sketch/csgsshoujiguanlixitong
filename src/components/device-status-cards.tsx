import { Panel, StatusPill } from "@/components/ui";
import type { DeviceStatusCard } from "@/lib/device-status-summary";

export function DeviceStatusCards({ items }: { items: DeviceStatusCard[] }) {
  return (
    <section className="device-status-section">
      <div className="device-status-section__header">
        <span className="device-status-section__eyebrow">手机状态</span>
        <p>直接汇总当前手机资产库的总量和状态分布，进入台账前先看清整体状态。</p>
      </div>
      <div className="stats-grid">
        {items.map((item) => (
          <Panel key={item.label} className="stat-card">
            <StatusPill tone={item.tone}>{item.label}</StatusPill>
            <div className="stat-card__value">{item.value}</div>
            <div className="stat-card__line" style={{ background: item.accent }} />
          </Panel>
        ))}
      </div>
    </section>
  );
}
