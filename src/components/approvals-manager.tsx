"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { CopyLinkButton } from "@/components/copy-link-button";
import { StatusPill } from "@/components/ui";
import type { ApprovalViewRow } from "@/lib/approvals-view";
import { canDeleteAssignmentApproval } from "@/lib/approval-record-lock";

export function ApprovalsManager({
  approvals,
  totalApprovals,
}: {
  approvals: ApprovalViewRow[];
  totalApprovals: number;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [localApprovals, setLocalApprovals] = useState(approvals);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLocalApprovals(approvals);
  }, [approvals]);

  async function deleteRecord(id: string) {
    const confirmed = window.confirm("确认删除这条领取确认记录吗？");
    if (!confirmed) return;

    setMessage("");
    const response = await fetch(`/api/approvals/${id}`, {
      method: "DELETE",
    });
    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setMessage(payload.message || "删除记录失败");
      return;
    }

    setLocalApprovals((current) => current.filter((item) => item.id !== id));
    startTransition(() => router.refresh());
  }

  return (
    <div className="approval-list">
      {totalApprovals ? <p className="panel__subtitle">当前共 {localApprovals.length} 条确认记录，每页显示 10 条。</p> : null}
      {message ? <p className="form-error">{message}</p> : null}
      {localApprovals.length ? localApprovals.map((item) => (
        <article key={item.id} className="approval-card approval-card--rich">
          {(() => {
            const deleteLocked = !canDeleteAssignmentApproval(item.status);

            return (
              <>
          <div className="employee-card__top">
            <div>
              <strong>{item.employeeName}</strong>
              <p>{item.employeeCode} · {item.department}</p>
            </div>
            <StatusPill tone={item.tone}>{item.status}</StatusPill>
          </div>
          <div className="employee-card__meta">
            <span>手机编号 {item.deviceSummary}</span>
            <span>所在地 {item.deviceLocationSummary || "待同步"}</span>
            <span>{item.deviceCodes.length > 1 ? `${item.deviceCodes.length} 台手机待确认` : item.deviceTitle}</span>
          </div>
          <div className="approval-card__links">
            <CopyLinkButton label="领取确认链接" value={item.confirmUrl} />
            <span>{item.signedAt ? `确认时间 ${item.signedAt}` : "待员工确认"}</span>
          </div>
          <div className="approval-card__links">
            {item.confirmationMethod ? <StatusPill tone="info">{item.confirmationMethod}</StatusPill> : <span />}
            <button
              type="button"
              className="button button--ghost"
              onClick={() => void deleteRecord(item.id)}
              disabled={isPending || deleteLocked}
            >
              {deleteLocked ? "已领取后锁定" : isPending ? "删除中..." : "删除记录"}
            </button>
          </div>
          {item.signatureImage ? (
            <Image className="approval-card__signature" src={item.signatureImage} alt={`${item.employeeName} 签字`} width={180} height={96} unoptimized />
          ) : null}
              </>
            );
          })()}
        </article>
      )) : <div className="device-empty">当前还没有分配确认记录，请先到领用分配页面生成记录。</div>}
    </div>
  );
}
