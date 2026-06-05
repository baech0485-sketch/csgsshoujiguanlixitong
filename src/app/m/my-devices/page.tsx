import { AssignmentIcon, DeviceIcon } from "@/components/icons";
import { MobileShell } from "@/components/mobile-shell";
import { Panel, PrimaryButton, StatusPill } from "@/components/ui";
import { getMobileDevicesView } from "@/lib/workflow-data";

export default async function MyDevicesPage() {
  const devices = await getMobileDevicesView();
  return (
    <main className="mobile-page-shell">
      <MobileShell title="我的手机" subtitle="当前名下 2 台设备" icon={<DeviceIcon color="var(--text-inverse)" />}>
        <Panel className="mobile-summary">
          <div className="mobile-summary__value">{devices.length}</div><div className="mobile-summary__label">已领用设备</div><StatusPill tone="muted">资产状态实时同步</StatusPill>
        </Panel>
        {devices.map((item) => (
          <Panel key={item.title} className="mobile-device-card">
            <div className="mobile-device-card__thumb" />
            <div className="mobile-device-card__info"><h2>{item.title}</h2><p>{item.code}</p>{"location" in item ? <p>所在地 {String(item.location)}</p> : null}{item.status ? <StatusPill tone={item.tone as "selected" | "warning"}>{item.status}</StatusPill> : null}</div>
            {item.footer ? <div className="mobile-device-card__footer">{item.footer}</div> : null}
          </Panel>
        ))}
        <PrimaryButton href="/m/receipt-confirm"><AssignmentIcon color="var(--text-inverse)" />进入确认流程</PrimaryButton>
      </MobileShell>
    </main>
  );
}
