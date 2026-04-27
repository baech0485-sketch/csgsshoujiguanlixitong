import { RecoveryIcon } from "@/components/icons";
import { MobileShell } from "@/components/mobile-shell";
import { Panel } from "@/components/ui";

export default function ReturnSuccessPage() {
  return (
    <main className="mobile-page-shell">
      <MobileShell title="归还完成" subtitle="归还确认回执已提交成功" icon={<RecoveryIcon color="var(--text-inverse)" />}>
        <Panel title="提交成功" subtitle="系统已完成本次资产回收，并已同步手机回库结果。">
          <div className="db-empty">你现在可以关闭当前页面，如有问题请联系资产管理员。</div>
        </Panel>
      </MobileShell>
    </main>
  );
}
