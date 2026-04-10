"use client";

import { CopyLinkButton } from "@/components/copy-link-button";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { PrimaryButton, StatusPill } from "@/components/ui";
import type { OffboardingCaseRow, OffboardingEmployeeOption } from "@/lib/offboarding-view";

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
  const [leavingDate] = useState(new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const selectedEmployee = employees.find((item) => item.employeeCode === selectedEmployeeCode);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/offboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeCode: selectedEmployeeCode, leavingDate }),
    });
    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setMessage(payload.message || "发起离职回收失败");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <section className="approval-page-layout">
      <form className="panel approval-create-panel" onSubmit={handleCreate}>
        <h2 className="panel__title">发起离职回收</h2>
        <p className="panel__subtitle">先从所有在职员工中选择一人，系统会自动读取其名下已分配手机，并生成员工可打开的归还确认链接。</p>
        <label className="field">
          <span>选择在职员工</span>
          <select aria-label="选择在职员工" value={selectedEmployeeCode} onChange={(event) => setSelectedEmployeeCode(event.target.value)}>
            <option value="">请选择员工</option>
            {employees.map((item, index) => <option key={`${item.employeeCode}-${index}`} value={item.employeeCode}>{item.label}</option>)}
          </select>
        </label>
        <label className="field">
          <span>离职日期</span>
          <input aria-label="离职日期" value={leavingDate} readOnly placeholder="YYYY-MM-DD" />
        </label>
        <div className="risk-card">
          <h3>待回收手机预览</h3>
          <p>{selectedEmployee ? `当前已选择 ${selectedEmployee.label}，以下手机会进入本次回收清单。` : "请选择在职员工后查看其名下手机。"}</p>
          <div className="employee-list">
            {selectedEmployee?.devices.length ? selectedEmployee.devices.map((item) => (
              <article key={item.deviceCode} className="employee-card">
                <div className="employee-card__avatar" />
                <div className="employee-card__body">
                  <div className="employee-card__top">
                    <div>
                      <strong>{item.deviceCode}</strong>
                      <p>{item.deviceTitle}</p>
                    </div>
                    <StatusPill tone="warning">待回收</StatusPill>
                  </div>
                </div>
              </article>
            )) : <div className="device-empty">当前选中员工名下暂无可回收手机。</div>}
          </div>
        </div>
        <div className="approval-create-panel__actions">
          {message ? <p className="form-error">{message}</p> : null}
          <PrimaryButton type="submit" disabled={isPending || !selectedEmployeeCode || !selectedEmployee?.devices.length}>生成离职回收链接</PrimaryButton>
          {isPending ? <p className="panel__subtitle">提交中...</p> : null}
        </div>
      </form>
      <div>
        {totalCases ? <p className="panel__subtitle">当前共 {totalCases} 条回收记录，每页显示 10 条。</p> : null}
        {cases.map((item) => (
          <article key={`${item.employeeCode}-${item.leavingDate}`} className="panel approval-card">
            <h3>{item.employeeName} · {item.department}</h3>
            <p>离职日期：{item.leavingDate}</p>
            <StatusPill tone={item.status === "已回收" ? "success" : "warning"}>{item.status}</StatusPill>
            <p>名下设备：{item.devices.length ? item.devices.map((device) => device.deviceCode).join("、") : "暂无设备"}</p>
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
