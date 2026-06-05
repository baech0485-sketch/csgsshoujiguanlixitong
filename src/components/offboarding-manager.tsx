"use client";

import { CopyLinkButton } from "@/components/copy-link-button";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { PrimaryButton, StatusPill } from "@/components/ui";
import { getRecoveryModeMeta, type RecoveryMode } from "@/lib/recovery-mode";
import type { OffboardingCaseRow, OffboardingEmployeeOption } from "@/lib/offboarding-view";

const recoveryModes: RecoveryMode[] = ["offboarding", "active"];

export function OffboardingManager({
  employees,
  cases,
  totalCases,
}: {
  employees: OffboardingEmployeeOption[];
  cases: OffboardingCaseRow[];
  totalCases: number;
}) {
  const router = useRouter();
  const [selectedEmployeeCode, setSelectedEmployeeCode] = useState(employees[0]?.employeeCode || "");
  const [mode, setMode] = useState<RecoveryMode>("offboarding");
  const [recordDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedDeviceCodes, setSelectedDeviceCodes] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const selectedEmployee = employees.find((item) => item.employeeCode === selectedEmployeeCode);
  const modeMeta = getRecoveryModeMeta(mode);
  const isActiveRecovery = mode === "active";
  const canSubmit = isActiveRecovery
    ? Boolean(selectedEmployeeCode) && selectedDeviceCodes.length > 0
    : Boolean(selectedEmployeeCode) && Boolean(selectedEmployee?.devices.length);

  useEffect(() => {
    setSelectedDeviceCodes([]);
  }, [mode, selectedEmployeeCode]);

  function toggleSelectedDevice(deviceCode: string, checked: boolean) {
    setSelectedDeviceCodes((current) => {
      if (checked) {
        return current.includes(deviceCode) ? current : [...current, deviceCode];
      }
      return current.filter((item) => item !== deviceCode);
    });
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/offboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeCode: selectedEmployeeCode,
        leavingDate: recordDate,
        mode,
        selectedDeviceCodes,
      }),
    });
    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setMessage(payload.message || modeMeta.createErrorMessage);
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <section className="approval-page-layout">
      <form className="panel approval-create-panel" onSubmit={handleCreate}>
        <div className="filters-row">
          {recoveryModes.map((item) => {
            const itemMeta = getRecoveryModeMeta(item);
            return (
              <button
                key={item}
                type="button"
                className="plain-chip-button"
                aria-pressed={item === mode}
                onClick={() => setMode(item)}
              >
                <StatusPill tone={item === mode ? "selected" : "muted"}>{itemMeta.label}</StatusPill>
              </button>
            );
          })}
        </div>
        <h2 className="panel__title">{modeMeta.formTitle}</h2>
        <p className="panel__subtitle">{modeMeta.formSubtitle}</p>
        <label className="field">
          <span>选择在职员工</span>
          <select aria-label="选择在职员工" value={selectedEmployeeCode} onChange={(event) => setSelectedEmployeeCode(event.target.value)}>
            <option value="">请选择员工</option>
            {employees.map((item, index) => <option key={`${item.employeeCode}-${index}`} value={item.employeeCode}>{item.label}</option>)}
          </select>
        </label>
        <label className="field">
          <span>{modeMeta.dateLabel}</span>
          <input aria-label={modeMeta.dateLabel} value={recordDate} readOnly placeholder="YYYY-MM-DD" />
        </label>
        <div className="risk-card">
          <h3>待回收手机预览</h3>
          <p>{selectedEmployee ? `当前已选择 ${selectedEmployee.label}，以下手机会进入本次${modeMeta.label}清单。` : "请选择在职员工后查看其名下手机。"}</p>
          {selectedEmployee?.devices.length ? (
            isActiveRecovery ? (
              <div className="assignment-device-list">
                {selectedEmployee.devices.map((item) => {
                  const checked = selectedDeviceCodes.includes(item.deviceCode);
                  return (
                    <label key={item.deviceCode} className={`assignment-device-option${checked ? " is-selected" : ""}`}>
                      <input
                        aria-label={`选择回收设备 ${item.deviceCode}`}
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => toggleSelectedDevice(item.deviceCode, event.target.checked)}
                      />
                      <div className="assignment-device-option__body">
                        <strong>{item.deviceCode}</strong>
                        <p>{item.deviceTitle}</p>
                        <p>所在地：{item.location}</p>
                      </div>
                      <StatusPill tone={checked ? "selected" : "warning"}>{checked ? "已选择" : "待选择"}</StatusPill>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="employee-list">
                {selectedEmployee.devices.map((item) => (
                  <article key={item.deviceCode} className="employee-card">
                    <div className="employee-card__avatar" />
                    <div className="employee-card__body">
                      <div className="employee-card__top">
                        <div>
                          <strong>{item.deviceCode}</strong>
                          <p>{item.deviceTitle}</p>
                          <p>所在地：{item.location}</p>
                        </div>
                        <StatusPill tone="warning">待回收</StatusPill>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )
          ) : <div className="device-empty">当前选中员工名下暂无可回收手机。</div>}
        </div>
        <div className="approval-create-panel__actions">
          {message ? <p className="form-error">{message}</p> : null}
          {!canSubmit && isActiveRecovery && selectedEmployee?.devices.length ? <p className="panel__subtitle">请先勾选至少一台要回收的手机。</p> : null}
          <PrimaryButton type="submit" disabled={isPending || !canSubmit}>{modeMeta.createButtonLabel}</PrimaryButton>
          {isPending ? <p className="panel__subtitle">提交中...</p> : null}
        </div>
      </form>
      <div>
        {totalCases ? <p className="panel__subtitle">当前共 {totalCases} 条回收记录，每页显示 10 条。</p> : null}
        {cases.map((item) => (
          <article key={item.confirmUrl || `${item.employeeCode}-${item.leavingDate}`} className="panel approval-card">
            <h3>{item.employeeName} · {item.department}</h3>
            <p>{getRecoveryModeMeta(item.mode).recordDateLabel}：{item.leavingDate}</p>
            <div className="approval-card__links">
              <StatusPill tone="info">{getRecoveryModeMeta(item.mode).label}</StatusPill>
              <span>{getRecoveryModeMeta(item.mode).recordHint}</span>
            </div>
            <StatusPill tone={item.status === "已回收" ? "success" : "warning"}>{item.status}</StatusPill>
            <p>名下设备：{item.devices.length ? item.devices.map((device) => `${device.deviceCode}（${device.location}）`).join("、") : "暂无设备"}</p>
            <div className="approval-card__links">
              <CopyLinkButton label="归还确认链接" value={item.confirmUrl} />
              <span>{item.signedAt ? `确认时间 ${item.signedAt}` : "待员工确认"}</span>
            </div>
            {item.confirmationMethod ? <StatusPill tone="info">{item.confirmationMethod}</StatusPill> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
