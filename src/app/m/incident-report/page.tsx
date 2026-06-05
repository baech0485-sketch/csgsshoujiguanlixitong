import { IncidentReportForm } from "@/components/incident-report-form";
import { IncidentIcon } from "@/components/icons";
import { MobileShell } from "@/components/mobile-shell";
import { Panel } from "@/components/ui";
import { getFirstDeviceByStatus } from "@/lib/workflow-data";

export default async function IncidentReportPage() {
  const device = (await getFirstDeviceByStatus("已分配")) ?? {
    code: "sj-18",
    title: "iPhone 14 Pro",
    imei1: "",
    status: "已分配",
    location: "宜昌",
  };
  return (
    <main className="mobile-page-shell">
      <MobileShell title="异常申报" subtitle="如设备损坏、丢失请立即提交" icon={<IncidentIcon color="var(--text-inverse)" />}>
        <Panel title="异常申报设备" subtitle={`当前默认提交设备：${device.code}`} className="mobile-check-panel">
          <div className="panel__subtitle">设备：{device.title}</div>
          <div className="panel__subtitle">所在地：{device.location}</div>
        </Panel>
        <Panel title="异常类型与说明" subtitle="提交后会同步到异常管理和设备状态" className="mobile-check-panel">
          <IncidentReportForm assetCode={device.code} />
        </Panel>
      </MobileShell>
    </main>
  );
}
