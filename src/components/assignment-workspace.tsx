"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { AssignmentIcon } from "@/components/icons";
import { PrimaryButton, StatusPill } from "@/components/ui";
import type { AssignmentDeviceOption, AssignmentEmployeeOption } from "@/lib/assignment-view";

export function AssignmentWorkspace({
  employees,
  devices,
}: {
  employees: AssignmentEmployeeOption[];
  devices: AssignmentDeviceOption[];
}) {
  const router = useRouter();
  const [selectedEmployeeCode, setSelectedEmployeeCode] = useState(employees[0]?.employeeCode || "");
  const [selectedDeviceCodes, setSelectedDeviceCodes] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState("全部");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const selectedCount = selectedDeviceCodes.length;
  const deviceMap = useMemo(() => new Map(devices.map((item) => [item.deviceCode, item])), [devices]);
  const filteredDevices = useMemo(
    () => locationFilter === "全部" ? devices : devices.filter((item) => item.location === locationFilter),
    [devices, locationFilter],
  );

  useEffect(() => {
    setSelectedDeviceCodes((current) => current.filter((code) => deviceMap.has(code)));
  }, [deviceMap]);

  async function assign() {
    if (!selectedEmployeeCode || !selectedDeviceCodes.length) {
      setMessage("请选择员工和至少一台设备");
      return;
    }

    setMessage("");
    const response = await fetch("/api/assignments/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeCode: selectedEmployeeCode, deviceCodes: selectedDeviceCodes }),
    });

    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setMessage(payload.message || "分配失败");
      return;
    }

    setSelectedDeviceCodes([]);
    startTransition(() => router.refresh());
  }

  function toggleDevice(deviceCode: string, checked: boolean) {
    setSelectedDeviceCodes((current) =>
      checked ? [...new Set([...current, deviceCode])] : current.filter((code) => code !== deviceCode),
    );
  }

  return (
    <form className="panel approval-create-panel" onSubmit={(event) => {
      event.preventDefault();
      void assign();
    }}>
      <h2 className="panel__title">发起领用分配</h2>
      <p className="panel__subtitle">选择在职员工并勾选一台或多台待分配手机，系统会逐台生成领取确认链接并同步到下方确认记录。</p>
      <label className="field">
        <span>选择员工</span>
        <select value={selectedEmployeeCode} onChange={(event) => setSelectedEmployeeCode(event.target.value)}>
          <option value="">请选择员工</option>
          {employees.map((item, index) => <option key={`${item.employeeCode}-${index}`} value={item.employeeCode}>{item.label}</option>)}
        </select>
      </label>
      <label className="field">
        <span>选择设备</span>
        <div className="panel__subtitle">可一次勾选多台待分配手机，当前已选择 {selectedCount} 台。</div>
        <label className="filter-select assignment-location-filter">
          <span>手机所在地</span>
          <select aria-label="手机所在地筛选" value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
            <option value="全部">全部</option>
            <option value="宜昌">宜昌</option>
            <option value="武汉">武汉</option>
          </select>
        </label>
        <div className="assignment-device-list">
          {filteredDevices.length ? filteredDevices.map((item) => (
            <label key={item.deviceCode} className={`assignment-device-option${selectedDeviceCodes.includes(item.deviceCode) ? " is-selected" : ""}`}>
              <input
                aria-label={`选择设备 ${item.deviceCode}`}
                type="checkbox"
                checked={selectedDeviceCodes.includes(item.deviceCode)}
                onChange={(event) => toggleDevice(item.deviceCode, event.target.checked)}
              />
              <div className="assignment-device-option__body">
                <strong>{item.deviceCode}</strong>
                <p>{item.label.split("·").slice(1).join("·").trim() || item.label}</p>
                <p>所在地：{item.location}</p>
              </div>
              <StatusPill tone="success">{item.status}</StatusPill>
            </label>
          )) : <div className="device-empty">{devices.length ? "当前所在地筛选下没有可分配手机。" : "当前没有可分配设备，请先录入待分配手机。"}</div>}
        </div>
      </label>
      {message ? <p className="form-error">{message}</p> : null}
      <PrimaryButton type="submit" disabled={isPending}><AssignmentIcon color="var(--text-inverse)" />{isPending ? "提交中..." : "提交分配"}</PrimaryButton>
      {isPending ? <p className="panel__subtitle">分配处理中...</p> : null}
    </form>
  );
}
