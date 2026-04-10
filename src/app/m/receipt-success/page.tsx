import { CheckIcon } from "@/components/icons";
import { MobileShell } from "@/components/mobile-shell";
import { Panel } from "@/components/ui";

export default function ReceiptSuccessPage() {
  return (
    <main className="mobile-page-shell">
      <MobileShell title="领取完成" subtitle="手机领取确认回执已提交成功" icon={<CheckIcon color="var(--text-inverse)" />}>
        <Panel title="提交成功" subtitle="系统已记录本次领取确认、勾选回执与提交时间。">
          <div className="db-empty">你现在可以关闭当前页面，如有问题请联系资产管理员。</div>
        </Panel>
      </MobileShell>
    </main>
  );
}
