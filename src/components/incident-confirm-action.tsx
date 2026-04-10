"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { IncidentIcon } from "@/components/icons";
import { PrimaryButton } from "@/components/ui";

export function IncidentConfirmAction({ token }: { token: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [checks, setChecks] = useState({
    incident: false,
    owner: false,
    repair: false,
  });
  const [signedByAgreement, setSignedByAgreement] = useState(false);
  const [isPending, startTransition] = useTransition();
  const canSubmit = Object.values(checks).every(Boolean) && signedByAgreement;

  async function handleClick() {
    setMessage("");
    const response = await fetch("/api/workflows/incident-confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        checklistConfirmed: Object.values(checks).every(Boolean),
        signedByAgreement,
      }),
    });
    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setMessage(payload.message || "提交失败");
      return;
    }
    startTransition(() => router.push("/m/incident-success"));
  }

  return (
    <>
      <div className="mobile-checklist">
        <label className="mobile-check-option"><input aria-label="确认以上异常情况属实" type="checkbox" checked={checks.incident} onChange={(event) => setChecks((current) => ({ ...current, incident: event.target.checked }))} /><span>确认以上异常情况属实</span></label>
        <label className="mobile-check-option"><input aria-label="确认该手机当前由本人负责使用" type="checkbox" checked={checks.owner} onChange={(event) => setChecks((current) => ({ ...current, owner: event.target.checked }))} /><span>确认该手机当前由本人负责使用</span></label>
        <label className="mobile-check-option"><input aria-label="确认知晓该手机会转入维修中处理" type="checkbox" checked={checks.repair} onChange={(event) => setChecks((current) => ({ ...current, repair: event.target.checked }))} /><span>确认知晓该手机会转入维修中处理</span></label>
      </div>
      <div className="mobile-agreement-card">
        <label className="mobile-agreement-card__label">
          <input aria-label="我已核对以上异常信息，并同意以本次勾选确认作为本人异常回执" type="checkbox" checked={signedByAgreement} onChange={(event) => setSignedByAgreement(event.target.checked)} />
          <span>我已核对以上异常信息，并同意以本次勾选确认作为本人异常回执</span>
        </label>
        <p className="mobile-agreement-card__hint">提交后系统会把该手机转入维修中，并同步更新员工管理和手机资产状态。</p>
      </div>
      {!canSubmit ? <p className="panel__subtitle">请先完成异常核对项，并勾选最终确认声明。</p> : null}
      <div className="mobile-receipt-actions">
        <PrimaryButton onClick={handleClick} disabled={isPending || !canSubmit}>
          <IncidentIcon color="var(--text-inverse)" />
          {isPending ? "提交中..." : "确认异常并提交回执"}
        </PrimaryButton>
      </div>
      {message ? <p className="form-error">{message}</p> : null}
    </>
  );
}
