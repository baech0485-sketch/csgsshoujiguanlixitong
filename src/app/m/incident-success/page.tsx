import { IncidentIcon } from "@/components/icons";
import { MobileShell } from "@/components/mobile-shell";
import { Panel } from "@/components/ui";

export default function IncidentSuccessPage() {
  return (
    <main className="mobile-page-shell">
      <MobileShell title="异常确认完成" subtitle="异常确认回执已提交成功" icon={<IncidentIcon color="var(--text-inverse)" />}>
        <Panel title="提交成功" subtitle="系统已记录本次异常确认，并已把手机状态同步为维修中。">
          <div className="db-empty">你现在可以关闭当前页面，如有问题请联系管理员。</div>
        </Panel>
      </MobileShell>
    </main>
  );
}
