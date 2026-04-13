"use client";

import { useEffect, useState } from "react";
import { EmployeeIcon } from "@/components/icons";
import { PrimaryButton } from "@/components/ui";
import type { EmployeeViewRow } from "@/lib/employee-data";
import { DEFAULT_EMPLOYEE_TITLE, EMPLOYEE_DEPARTMENTS } from "@/lib/employee-input";

type EmployeeEditModalProps = {
  employee: EmployeeViewRow | null;
  onClose: () => void;
  onSaved: (employee: EmployeeViewRow) => void;
};

type EmployeeEditForm = {
  name: string;
  department: string;
  phone: string;
  title: string;
  status: string;
};

function buildInitialForm(employee: EmployeeViewRow): EmployeeEditForm {
  return {
    name: employee.name,
    department: employee.department,
    phone: employee.phone,
    title: employee.title || DEFAULT_EMPLOYEE_TITLE,
    status: employee.status,
  };
}

export function EmployeeEditModal({ employee, onClose, onSaved }: EmployeeEditModalProps) {
  const [form, setForm] = useState<EmployeeEditForm | null>(employee ? buildInitialForm(employee) : null);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm(employee ? buildInitialForm(employee) : null);
    setMessage("");
    setIsSaving(false);
  }, [employee]);

  if (!employee || !form) {
    return null;
  }

  const currentEmployee = employee;
  const currentForm = form;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);

    const response = await fetch(`/api/employees/${currentEmployee.employeeCode}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentForm),
    });
    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setMessage(payload.message || "保存员工信息失败");
      setIsSaving(false);
      return;
    }

    onSaved({
      ...currentEmployee,
      ...currentForm,
    });
    setIsSaving(false);
  }

  return (
    <div className="modal-layer modal-layer--scroll" onClick={onClose}>
      <form
        className="modal-card modal-card--employee-edit"
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-card__header">
          <div>
            <h2>编辑员工信息</h2>
            <p>支持直接修改员工姓名、部门、岗位、电话和在职状态，保存后会同步更新员工台账。</p>
          </div>
          <button className="modal-close" type="button" aria-label="关闭编辑员工弹窗" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="employee-edit-hero">
          <div className="employee-card__avatar"><EmployeeIcon color="var(--text-inverse)" /></div>
          <div>
            <strong>{currentEmployee.employeeCode}</strong>
            <p>{currentEmployee.deviceCount + currentEmployee.repairingCount} 台手机责任链路已关联到该员工名下。</p>
          </div>
        </div>
        <div className="modal-grid">
          <label className="field">
            <span>员工编号</span>
            <input aria-label="编辑员工编号" value={currentEmployee.employeeCode} readOnly />
          </label>
          <label className="field">
            <span>状态</span>
            <select
              aria-label="编辑状态"
              value={form.status}
              onChange={(event) => setForm((current) => current ? { ...current, status: event.target.value } : current)}
            >
              <option value="在职">在职</option>
              <option value="离职">离职</option>
            </select>
          </label>
          <label className="field">
            <span>姓名</span>
            <input
              aria-label="编辑姓名"
              value={form.name}
              onChange={(event) => setForm((current) => current ? { ...current, name: event.target.value } : current)}
            />
          </label>
          <label className="field">
            <span>部门</span>
            <select
              aria-label="编辑部门"
              value={form.department}
              onChange={(event) => setForm((current) => current ? { ...current, department: event.target.value } : current)}
            >
              {EMPLOYEE_DEPARTMENTS.map((department) => <option key={department} value={department}>{department}</option>)}
            </select>
          </label>
          <label className="field">
            <span>岗位</span>
            <input
              aria-label="编辑岗位"
              value={form.title}
              onChange={(event) => setForm((current) => current ? { ...current, title: event.target.value } : current)}
            />
          </label>
          <label className="field">
            <span>联系电话</span>
            <input
              aria-label="编辑联系电话"
              value={form.phone}
              onChange={(event) => setForm((current) => current ? { ...current, phone: event.target.value } : current)}
            />
          </label>
        </div>
        <div className="modal-note">员工编号为系统唯一标识，编辑时保持只读。若将状态改为离职，相关流程页会按最新状态重新过滤该员工。</div>
        {message ? <p className="form-error">{message}</p> : null}
        <div className="modal-actions">
          <button className="button button--ghost" type="button" onClick={onClose} disabled={isSaving}>取消</button>
          <PrimaryButton type="submit" disabled={isSaving}>{isSaving ? "保存中..." : "保存员工信息"}</PrimaryButton>
        </div>
      </form>
    </div>
  );
}
