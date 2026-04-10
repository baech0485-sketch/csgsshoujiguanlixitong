import { MobileShell } from "@/components/mobile-shell";
import { RecordsIcon } from "@/components/icons";
import { Panel, StatusPill } from "@/components/ui";
import { getRecordsView } from "@/lib/workflow-data";

export default async function MyRecordsPage() {
  const rows = await getRecordsView();
  return (
    <main className="mobile-page-shell">
      <MobileShell title="我的记录" subtitle="查看审批与历史流转" icon={<RecordsIcon color="var(--text-inverse)" />}>
        <Panel className="mobile-tabs"><StatusPill tone="selected">我的审批</StatusPill><StatusPill tone="muted">历史记录</StatusPill></Panel>
        <Panel className="mobile-records-panel">
          {rows.map((item) => <div key={item.title + item.desc} className="mobile-record-card"><h2>{item.title}</h2><p>{item.desc}</p><StatusPill tone={item.tone as "selected" | "warning" | "danger"}>{item.status}</StatusPill></div>)}
        </Panel>
      </MobileShell>
    </main>
  );
}
