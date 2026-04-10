"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckIcon } from "@/components/icons";
import { PrimaryButton } from "@/components/ui";

export function ReceiptConfirmAction({ token }: { token: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [checks, setChecks] = useState({
    appearance: false,
    assetCode: false,
    owner: false,
    care: false,
  });
  const [signedByAgreement, setSignedByAgreement] = useState(false);
  const [isPending, startTransition] = useTransition();
  const checklistConfirmed = Object.values(checks).every(Boolean);
  const canSubmit = checklistConfirmed && signedByAgreement;

  async function handleClick() {
    setMessage("");
    const response = await fetch("/api/workflows/receipt-confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, checklistConfirmed, signedByAgreement }),
    });
    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setMessage(payload.message || "确认失败");
      return;
    }
    startTransition(() => router.push("/m/receipt-success"));
  }

  return (
    <>
      <div className="mobile-checklist">
        <label className="mobile-check-option"><input aria-label="确认设备外观完好" type="checkbox" checked={checks.appearance} onChange={(event) => setChecks((current) => ({ ...current, appearance: event.target.checked }))} /><span>确认设备外观完好</span></label>
        <label className="mobile-check-option"><input aria-label="确认手机编号与页面一致" type="checkbox" checked={checks.assetCode} onChange={(event) => setChecks((current) => ({ ...current, assetCode: event.target.checked }))} /><span>确认手机编号与页面一致</span></label>
        <label className="mobile-check-option"><input aria-label="确认责任人为本人" type="checkbox" checked={checks.owner} onChange={(event) => setChecks((current) => ({ ...current, owner: event.target.checked }))} /><span>确认责任人为本人</span></label>
        <label className="mobile-check-option"><input aria-label="同意妥善保管设备" type="checkbox" checked={checks.care} onChange={(event) => setChecks((current) => ({ ...current, care: event.target.checked }))} /><span>同意妥善保管设备</span></label>
      </div>
      <div className="mobile-agreement-card">
        <label className="mobile-agreement-card__label">
          <input
            aria-label="我已核对以上信息，并同意以本次勾选确认作为本人签收凭证"
            type="checkbox"
            checked={signedByAgreement}
            onChange={(event) => setSignedByAgreement(event.target.checked)}
          />
          <span>我已核对以上信息，并同意以本次勾选确认作为本人签收凭证</span>
        </label>
        <p className="mobile-agreement-card__hint">提交后系统会记录确认时间，并以“勾选确认”作为本次电子签收回执。</p>
      </div>
      {!canSubmit ? <p className="panel__subtitle">请先完成全部核对项，并勾选最终确认声明。</p> : null}
      <div className="mobile-receipt-actions">
        <PrimaryButton onClick={handleClick} disabled={isPending || !canSubmit}><CheckIcon color="var(--text-inverse)" />{isPending ? "确认中..." : "确认领取并提交回执"}</PrimaryButton>
        <p className="mobile-receipt-note">确认完成后，设备会正式绑定到你的责任名下，并同步更新审批中心记录。</p>
      </div>
      {message ? <p className="form-error">{message}</p> : null}
    </>
  );
}
