"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AddIcon, EmployeeIcon } from "@/components/icons";
import { EmployeeEditModal } from "@/components/employee-edit-modal";
import { PrimaryButton, StatusPill } from "@/components/ui";
import type { EmployeeSummary, EmployeeViewRow } from "@/lib/employee-data";
import { DEFAULT_EMPLOYEE_TITLE, EMPLOYEE_DEPARTMENTS } from "@/lib/employee-input";

type EmployeeCreateForm = {
  name: string;
  department: string;
};

const initialForm: EmployeeCreateForm = {
  name: "",
  department: EMPLOYEE_DEPARTMENTS[0],
};

export function EmployeesManager({
  visibleEmployees,
  nextEmployeeCode,
  summary,
}: {
  visibleEmployees: EmployeeViewRow[];
  nextEmployeeCode: string;
  summary: EmployeeSummary;
}) {
  const router = useRouter();
  const [localEmployees, setLocalEmployees] = useState(visibleEmployees);
  const [form, setForm] = useState<EmployeeCreateForm>(initialForm);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeViewRow | null>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLocalEmployees(visibleEmployees);
  }, [visibleEmployees]);

  async function refresh() {
    startTransition(() => router.refresh());
  }

  async function createEmployee(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeCode: nextEmployeeCode,
        name: form.name,
        department: form.department,
        phone: "",
        title: DEFAULT_EMPLOYEE_TITLE,
        status: "在职",
      }),
    });
    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setMessage(payload.message || "新增员工失败");
      return;
    }
    setForm(initialForm);
    await refresh();
  }

  function handleEmployeeSaved(employee: EmployeeViewRow) {
    setLocalEmployees((current) => current.map((item) => (
      item.employeeCode === employee.employeeCode ? employee : item
    )));
    setEditingEmployee(null);
    startTransition(() => router.refresh());
  }

  return (
    <>
      <section className="employee-layout">
        <div className="employee-main">
          <div className="stats-grid stats-grid--three">
            <div className="panel stat-card">
              <StatusPill tone="selected">员工总数</StatusPill>
              <div className="stat-card__value">{String(summary.total).padStart(2, "0")}</div>
              <div className="stat-card__line" style={{ background: "var(--line-teal-dark)" }} />
            </div>
            <div className="panel stat-card">
              <StatusPill tone="success">在职人数</StatusPill>
              <div className="stat-card__value">{String(summary.active).padStart(2, "0")}</div>
              <div className="stat-card__line" style={{ background: "var(--success)" }} />
            </div>
            <div className="panel stat-card">
              <StatusPill tone="warning">离职人数</StatusPill>
              <div className="stat-card__value">{String(summary.inactive).padStart(2, "0")}</div>
              <div className="stat-card__line" style={{ background: "var(--warning)" }} />
            </div>
          </div>

          <div className="panel employee-list-panel">
            <h2 className="panel__title">员工台账</h2>
            <p className="panel__subtitle">统一维护员工在职状态，领用分配页只会读取在职员工。</p>
            <div className="employee-list">
              {localEmployees.length ? localEmployees.map((item, index) => (
                <article key={`${item.employeeCode}-${item.name}-${index}`} className="employee-card employee-card--interactive">
                  <button
                    type="button"
                    className="employee-card__edit-trigger"
                    aria-label={`编辑员工 ${item.name}`}
                    onClick={() => setEditingEmployee(item)}
                  />
                  <span className="employee-card__edit-chip">点击编辑</span>
                <div className="employee-card__avatar"><EmployeeIcon color="var(--text-inverse)" /></div>
                <div className="employee-card__body">
                  <div className="employee-card__top">
                    <div>
                      <strong>{item.name}</strong>
                      <p>{item.employeeCode} · {item.department}</p>
                    </div>
                    <StatusPill tone={item.status === "在职" ? "success" : "warning"}>{item.status}</StatusPill>
                  </div>
                  <div className="employee-card__meta">
                    <span>名下手机 {item.deviceCount + item.repairingCount} 台</span>
                    <span>使用中 {item.deviceCount} 台</span>
                    <span>维修中 {item.repairingCount} 台</span>
                    <span>岗位 {item.title || "未填写"}</span>
                  </div>
                </div>
                </article>
              )) : <div className="device-empty">当前暂无员工数据，请先录入员工。</div>}
            </div>
          </div>
        </div>

        <form className="panel employee-form-panel" onSubmit={createEmployee}>
          <h2 className="panel__title">新增员工</h2>
          <p className="panel__subtitle">录入员工后即可在领用分配页面选择该员工。</p>
          <label className="field"><span>员工编号</span><input aria-label="员工编号" value={nextEmployeeCode} readOnly /></label>
          <label className="field"><span>姓名</span><input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></label>
          <label className="field">
            <span>部门</span>
            <select aria-label="部门" value={form.department} onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))}>
              {EMPLOYEE_DEPARTMENTS.map((department) => <option key={department} value={department}>{department}</option>)}
            </select>
          </label>
          <label className="field"><span>岗位</span><input aria-label="岗位" value={DEFAULT_EMPLOYEE_TITLE} readOnly /></label>
          {message ? <p className="form-error">{message}</p> : null}
          <PrimaryButton type="submit" disabled={isPending}><AddIcon color="var(--text-inverse)" />{isPending ? "提交中..." : "新增员工"}</PrimaryButton>
        </form>
      </section>
      <EmployeeEditModal
        employee={editingEmployee}
        onClose={() => setEditingEmployee(null)}
        onSaved={handleEmployeeSaved}
      />
    </>
  );
}
