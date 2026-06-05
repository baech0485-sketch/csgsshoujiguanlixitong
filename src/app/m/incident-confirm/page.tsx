import Image from "next/image";
import { IncidentConfirmAction } from "@/components/incident-confirm-action";
import { IncidentIcon } from "@/components/icons";
import { MobileShell } from "@/components/mobile-shell";
import { Panel, StatusPill } from "@/components/ui";
import { getIncidentConfirmRecord } from "@/lib/mobile-confirmation-data";

type IncidentConfirmPageProps = {
  searchParams?: Promise<{
    token?: string;
  }>;
};

export default async function IncidentConfirmPage({ searchParams }: IncidentConfirmPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const token = params?.token?.trim() || "";
  const record = token ? await getIncidentConfirmRecord(token) : null;

  return (
    <main className="mobile-page-shell">
      <MobileShell title="异常确认" subtitle="请核对异常信息后勾选确认回执" icon={<IncidentIcon color="var(--text-inverse)" />}>
        {record ? (
          <>
            <Panel className="mobile-receipt-card">
              <div className="mobile-receipt-card__top">
                <div className="mobile-receipt-card__media">
                  {record.photoDataUrl ? (
                    <Image src={record.photoDataUrl} alt="异常手机" width={144} height={188} unoptimized />
                  ) : (
                    <div className="mobile-receipt-card__placeholder">无图片</div>
                  )}
                </div>
                <div className="mobile-receipt-card__body">
                  <StatusPill tone="danger">{record.type}</StatusPill>
                  <h2>{record.deviceTitle}</h2>
                  <p>本页用于确认手机异常情况。确认后，系统会把该手机转入维修中并同步员工名下状态。</p>
                </div>
              </div>
              <dl className="mobile-receipt-facts">
                <div><dt>手机编号</dt><dd>{record.deviceCode}</dd></div>
                <div><dt>手机所在地</dt><dd>{record.location}</dd></div>
                <div><dt>异常员工</dt><dd>{record.employeeName}</dd></div>
                <div><dt>员工编号</dt><dd>{record.employeeCode}</dd></div>
                <div><dt>所属部门</dt><dd>{record.department}</dd></div>
                <div><dt>序列号</dt><dd>{record.serialNumber || "未录入"}</dd></div>
                <div><dt>异常说明</dt><dd>{record.description || "未填写"}</dd></div>
              </dl>
            </Panel>
            <Panel title="异常确认回执" subtitle="请完成核对后勾选确认，系统会自动把手机转入维修中处理。">
              <IncidentConfirmAction token={token} />
            </Panel>
          </>
        ) : (
          <Panel title="链接无效" subtitle="当前异常确认链接不存在、已失效或未正确生成。">
            <div className="db-empty">请联系管理员重新生成异常确认链接。</div>
          </Panel>
        )}
      </MobileShell>
    </main>
  );
}
