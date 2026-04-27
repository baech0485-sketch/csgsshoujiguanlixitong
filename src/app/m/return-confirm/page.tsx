import { StatusPill } from "@/components/ui";
import { RecoveryIcon } from "@/components/icons";
import { ReturnConfirmAction } from "@/components/return-confirm-action";
import { MobileShell } from "@/components/mobile-shell";
import { Panel } from "@/components/ui";
import { getReturnConfirmRecord } from "@/lib/mobile-confirmation-data";
import { getRecoveryModeMeta } from "@/lib/recovery-mode";

type ReturnConfirmPageProps = {
  searchParams?: Promise<{
    token?: string;
  }>;
};

export default async function ReturnConfirmPage({ searchParams }: ReturnConfirmPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const token = params?.token?.trim() || "";
  const record = token ? await getReturnConfirmRecord(token) : null;
  const modeMeta = record ? getRecoveryModeMeta(record.mode) : null;

  return (
    <main className="mobile-page-shell">
      <MobileShell title="归还确认" subtitle="请核对归还清单后勾选确认回执" icon={<RecoveryIcon color="var(--text-inverse)" />}>
        {record ? (
          <>
            <Panel className="mobile-receipt-card">
              <div className="mobile-receipt-card__top">
                <div className="mobile-receipt-card__media mobile-receipt-card__media--stack">
                  <span className="mobile-receipt-card__stack-count">{record.devices.length}</span>
                  <span className="mobile-receipt-card__stack-label">待归还手机</span>
                </div>
                <div className="mobile-receipt-card__body">
                  <StatusPill tone="danger">{record.status}</StatusPill>
                  <h2>{record.employeeName} 的归还清单</h2>
                  <p>{modeMeta?.confirmIntro}</p>
                </div>
              </div>
              <dl className="mobile-receipt-facts">
                <div><dt>员工姓名</dt><dd>{record.employeeName}</dd></div>
                <div><dt>员工编号</dt><dd>{record.employeeCode}</dd></div>
                <div><dt>所属部门</dt><dd>{record.department || "待同步"}</dd></div>
                <div><dt>{modeMeta?.dateLabel}</dt><dd>{record.leavingDate || "未记录"}</dd></div>
              </dl>
            </Panel>
            <Panel title="待归还手机预览" subtitle="以下手机会在员工确认后自动解除责任人，并重新回到手机资产的待分配池。" className="mobile-check-panel mobile-check-panel--receipt">
              <div className="mobile-return-device-list">
                {record.devices.map((item) => (
                  <article key={item.deviceCode} className="mobile-return-device-card">
                    <div>
                      <strong>{item.deviceCode}</strong>
                      <p>{item.deviceTitle}</p>
                    </div>
                    <StatusPill tone="warning">待归还</StatusPill>
                  </article>
                ))}
              </div>
            </Panel>
            <Panel title="归还确认回执" subtitle={modeMeta?.confirmPanelSubtitle}>
              <ReturnConfirmAction token={token} mode={record.mode} />
            </Panel>
          </>
        ) : (
          <Panel title="链接无效" subtitle="当前归还确认链接不存在、已失效或未正确生成。">
            <div className="db-empty">请联系资产管理员重新生成归还链接。</div>
          </Panel>
        )}
      </MobileShell>
    </main>
  );
}
