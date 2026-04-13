import { DesktopShell } from "@/components/desktop-shell";
import { Panel } from "@/components/ui";

export default function Loading() {
  return (
    <main className="page-shell">
      <DesktopShell activeHref="/devices" title="手机资产台账" subtitle="页面已进入，云数据库数据会在页面内继续同步">
        <Panel title="云数据库加载中" subtitle="正在进入手机资产页并准备同步设备台账、状态卡片和右侧速览。">
          <div className="device-empty">页面壳已加载完成，设备数据返回后会直接填充当前页面。</div>
        </Panel>
      </DesktopShell>
    </main>
  );
}
