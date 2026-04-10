import { CopyLinkButton } from "@/components/copy-link-button";
import Image from "next/image";
import { StatusPill } from "@/components/ui";
import type { ApprovalViewRow } from "@/lib/approvals-view";

export function ApprovalsManager({
  approvals,
  totalApprovals,
}: {
  approvals: ApprovalViewRow[];
  totalApprovals: number;
}) {
  return (
    <div className="approval-list">
      {totalApprovals ? <p className="panel__subtitle">当前共 {totalApprovals} 条确认记录，每页显示 10 条。</p> : null}
      {approvals.length ? approvals.map((item) => (
        <article key={item.id} className="approval-card approval-card--rich">
          <div className="employee-card__top">
            <div>
              <strong>{item.employeeName}</strong>
              <p>{item.employeeCode} · {item.department}</p>
            </div>
            <StatusPill tone={item.tone}>{item.status}</StatusPill>
          </div>
          <div className="employee-card__meta">
            <span>手机编号 {item.deviceSummary}</span>
            <span>{item.deviceCodes.length > 1 ? `${item.deviceCodes.length} 台手机待确认` : item.deviceTitle}</span>
          </div>
          <div className="approval-card__links">
            <CopyLinkButton label="领取确认链接" value={item.confirmUrl} />
            <span>{item.signedAt ? `确认时间 ${item.signedAt}` : "待员工确认"}</span>
          </div>
          {item.confirmationMethod ? <StatusPill tone="info">{item.confirmationMethod}</StatusPill> : null}
          {item.signatureImage ? (
            <Image className="approval-card__signature" src={item.signatureImage} alt={`${item.employeeName} 签字`} width={180} height={96} unoptimized />
          ) : null}
        </article>
      )) : <div className="device-empty">当前还没有分配确认记录，请先到领用分配页面生成记录。</div>}
    </div>
  );
}
