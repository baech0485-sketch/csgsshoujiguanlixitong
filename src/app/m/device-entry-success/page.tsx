import { DeviceIcon } from "@/components/icons";
import { MobileShell } from "@/components/mobile-shell";
import { Panel } from "@/components/ui";

type DeviceEntrySuccessPageProps = {
  searchParams?: Promise<{
    code?: string;
  }>;
};

export default async function DeviceEntrySuccessPage({ searchParams }: DeviceEntrySuccessPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const code = params?.code?.trim() || "";

  return (
    <main className="mobile-page-shell">
      <MobileShell title="录入完成" subtitle="手机资产录入已提交成功" icon={<DeviceIcon color="var(--text-inverse)" />}>
        <Panel title="提交成功" subtitle={code ? `系统已生成手机编号 ${code}` : "系统已完成本次手机资产录入。"}>
          <div className="db-empty">你现在可以关闭当前页面，如需继续录入可返回上一页。</div>
        </Panel>
      </MobileShell>
    </main>
  );
}
