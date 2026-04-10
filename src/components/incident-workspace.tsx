"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IncidentIcon, SearchIcon } from "@/components/icons";
import { PrimaryButton, StatusPill } from "@/components/ui";
import type { IncidentEmployeeOption } from "@/lib/incident-management";

export function IncidentWorkspace({
  employees,
}: {
  employees: IncidentEmployeeOption[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedEmployeeCode, setSelectedEmployeeCode] = useState(employees[0]?.employeeCode || "");
  const [selectedDeviceCode, setSelectedDeviceCode] = useState("");
  const [type, setType] = useState<"丢失" | "维修">("维修");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredEmployees = useMemo(() => {
    const keyword = search.trim();
    if (!keyword) {
      return employees;
    }
    return employees.filter((item) => item.label.includes(keyword));
  }, [employees, search]);

  const selectedEmployee =
    filteredEmployees.find((item) => item.employeeCode === selectedEmployeeCode) ||
    filteredEmployees[0] ||
    null;
  const selectedDevice =
    selectedEmployee?.devices.find((item) => item.deviceCode === selectedDeviceCode) ||
    selectedEmployee?.devices[0] ||
    null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeCode: selectedEmployee?.employeeCode || "",
        deviceCode: selectedDevice?.deviceCode || "",
        type,
        description,
      }),
    });

    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setMessage(payload.message || "生成异常确认链接失败");
      return;
    }

    setDescription("");
    startTransition(() => router.refresh());
  }

  return (
    <form className="panel approval-create-panel" onSubmit={handleSubmit}>
      <h2 className="panel__title">发起异常确认</h2>
      <p className="panel__subtitle">先搜索员工，再从其名下手机里选择异常设备，生成员工可打开的异常确认链接。</p>
      <label className="filter-search">
        <span>搜索员工</span>
        <div className="filter-search__box">
          <SearchIcon color="var(--text-secondary)" />
          <input aria-label="搜索员工" value={search} placeholder="输入员工姓名" onChange={(event) => setSearch(event.target.value)} />
        </div>
      </label>
      <label className="field">
        <span>选择员工</span>
        <select aria-label="选择员工" value={selectedEmployee?.employeeCode || ""} onChange={(event) => setSelectedEmployeeCode(event.target.value)}>
          <option value="">请选择员工</option>
          {filteredEmployees.map((item) => <option key={item.employeeCode} value={item.employeeCode}>{item.label}</option>)}
        </select>
      </label>
      <div className="risk-card">
        <h3>员工名下手机</h3>
        <p>{selectedEmployee ? `当前已选择 ${selectedEmployee.label}，请选择其中一台异常手机。` : "请先搜索并选择员工。"}</p>
        <div className="employee-list">
          {selectedEmployee?.devices.length ? selectedEmployee.devices.map((item) => (
            <article key={item.deviceCode} className="employee-card">
              <div className="employee-card__avatar"><IncidentIcon color="var(--text-inverse)" /></div>
              <div className="employee-card__body">
                <div className="employee-card__top">
                  <div>
                    <strong>{item.deviceCode}</strong>
                    <p>{item.deviceTitle}</p>
                  </div>
                  <StatusPill tone={item.status === "修理中" ? "warning" : "selected"}>{item.status}</StatusPill>
                </div>
              </div>
            </article>
          )) : <div className="device-empty">当前员工名下暂无手机。</div>}
        </div>
      </div>
      <label className="field">
        <span>选择异常手机</span>
        <select aria-label="选择异常手机" value={selectedDevice?.deviceCode || ""} onChange={(event) => setSelectedDeviceCode(event.target.value)}>
          <option value="">请选择手机</option>
          {(selectedEmployee?.devices || []).map((item) => <option key={item.deviceCode} value={item.deviceCode}>{item.deviceCode} · {item.deviceTitle}</option>)}
        </select>
      </label>
      <label className="field">
        <span>异常类型</span>
        <select aria-label="异常类型" value={type} onChange={(event) => setType(event.target.value as "丢失" | "维修")}>
          <option value="维修">维修</option>
          <option value="丢失">丢失</option>
        </select>
      </label>
      <label className="field">
        <span>异常说明</span>
        <input aria-label="异常说明" value={description} placeholder="可选填写具体情况" onChange={(event) => setDescription(event.target.value)} />
      </label>
      {message ? <p className="form-error">{message}</p> : null}
      <PrimaryButton type="submit" disabled={isPending || !selectedEmployee || !selectedDevice}>
        <IncidentIcon color="var(--text-inverse)" />
        {isPending ? "提交中..." : "生成异常确认链接"}
      </PrimaryButton>
    </form>
  );
}
