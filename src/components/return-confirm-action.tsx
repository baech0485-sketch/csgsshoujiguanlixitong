"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RecoveryIcon } from "@/components/icons";
import { PrimaryButton } from "@/components/ui";

export function ReturnConfirmAction({ token }: { token: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [checks, setChecks] = useState({
    returnedAll: false,
    matchesPage: false,
    handover: false,
  });
  const [signedByAgreement, setSignedByAgreement] = useState(false);
  const [isPending, startTransition] = useTransition();
  const canSubmit = Object.values(checks).every(Boolean) && signedByAgreement;

  async function handleClick() {
    setMessage("");
    const response = await fetch("/api/workflows/return-confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, signedByAgreement }),
    });
    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setMessage(payload.message || "提交失败");
      return;
    }
    startTransition(() => router.push("/m/return-success"));
  }

  return (
    <>
      <div className="mobile-checklist">
        <label className="mobile-check-option"><input aria-label="确认以上手机已全部交回公司" type="checkbox" checked={checks.returnedAll} onChange={(event) => setChecks((current) => ({ ...current, returnedAll: event.target.checked }))} /><span>确认以上手机已全部交回公司</span></label>
        <label className="mobile-check-option"><input aria-label="确认设备外观和数量与页面一致" type="checkbox" checked={checks.matchesPage} onChange={(event) => setChecks((current) => ({ ...current, matchesPage: event.target.checked }))} /><span>确认设备外观和数量与页面一致</span></label>
        <label className="mobile-check-option"><input aria-label="确认本人已完成离职交接中的手机归还责任" type="checkbox" checked={checks.handover} onChange={(event) => setChecks((current) => ({ ...current, handover: event.target.checked }))} /><span>确认本人已完成离职交接中的手机归还责任</span></label>
      </div>
      <div className="mobile-agreement-card">
        <label className="mobile-agreement-card__label">
          <input
            aria-label="我已核对以上归还信息，并同意以本次勾选确认作为本人归还回执"
            type="checkbox"
            checked={signedByAgreement}
            onChange={(event) => setSignedByAgreement(event.target.checked)}
          />
          <span>我已核对以上归还信息，并同意以本次勾选确认作为本人归还回执</span>
        </label>
        <p className="mobile-agreement-card__hint">提交后系统会自动完成本次回收、员工离职状态同步和设备回库处理。</p>
      </div>
      {!canSubmit ? <p className="panel__subtitle">请先完成归还核对项，并勾选最终确认声明。</p> : null}
      <div className="mobile-receipt-actions">
        <PrimaryButton onClick={handleClick} disabled={isPending || !canSubmit}><RecoveryIcon color="var(--text-inverse)" />{isPending ? "提交中..." : "确认归还并提交回执"}</PrimaryButton>
        <p className="mobile-receipt-note">确认完成后，员工状态会自动变更为离职，设备会自动回收到手机资产并切回待分配。</p>
      </div>
      {message ? <p className="form-error">{message}</p> : null}
    </>
  );
}
