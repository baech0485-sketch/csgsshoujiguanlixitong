"use client";

import styles from "@/components/exchange-workspace.module.css";
import { StatusPill } from "@/components/ui";
import type { ExchangeEmployeeOption } from "@/lib/exchange-view";

export function ExchangeEmployeePanel({
  title,
  selectLabel,
  emptyText,
  employeeCode,
  selectedEmployeeCode,
  blockedEmployeeCode,
  employees,
  employee,
  selectedDeviceCodes,
  onSelectEmployee,
  onToggleDevice,
  selectableDevices,
  deviceCheckboxPrefix,
  passiveHint,
}: {
  title: string;
  selectLabel: string;
  emptyText: string;
  employeeCode: string;
  selectedEmployeeCode: string;
  blockedEmployeeCode: string;
  employees: ExchangeEmployeeOption[];
  employee: ExchangeEmployeeOption | null;
  selectedDeviceCodes: string[];
  onSelectEmployee: (employeeCode: string) => void;
  onToggleDevice: (deviceCode: string, checked: boolean) => void;
  selectableDevices: boolean;
  deviceCheckboxPrefix: string;
  passiveHint?: string;
}) {
  return (
    <article className={`panel ${styles.employeePanel}`}>
      <label className="field">
        <span>{title}</span>
        <select aria-label={selectLabel} value={selectedEmployeeCode} onChange={(event) => onSelectEmployee(event.target.value)}>
          <option value="">{emptyText}</option>
          {employees.map((item) => (
            <option key={`${employeeCode}-${item.employeeCode}`} value={item.employeeCode} disabled={item.employeeCode === blockedEmployeeCode}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      {employee ? (
        <>
          <div className={styles.employeeHeader}>
            <div className={styles.employeeMeta}>
              <strong>{employee.name}</strong>
              <p>{employee.employeeCode} · {employee.department}</p>
            </div>
            <StatusPill tone="selected">已分配 {employee.deviceCount} 台</StatusPill>
          </div>
          {passiveHint ? <p className={styles.passiveHint}>{passiveHint}</p> : null}
          <div className={styles.deviceList}>
            {employee.devices.map((device) => (
              <label
                key={device.deviceCode}
                className={`${styles.deviceOption} ${selectedDeviceCodes.includes(device.deviceCode) ? styles.deviceOptionSelected : ""} ${!selectableDevices ? styles.deviceOptionPassive : ""}`.trim()}
              >
                {selectableDevices ? (
                  <input
                    aria-label={`勾选${deviceCheckboxPrefix}设备 ${device.deviceCode}`}
                    type="checkbox"
                    checked={selectedDeviceCodes.includes(device.deviceCode)}
                    onChange={(event) => onToggleDevice(device.deviceCode, event.target.checked)}
                  />
                ) : <span className={styles.deviceOptionMarker}>→</span>}
                <div className={styles.deviceInfo}>
                  <strong>{device.deviceCode}</strong>
                  <p>{device.deviceTitle || "设备信息待同步"}</p>
                  <p>所在地：{device.location}</p>
                </div>
                <StatusPill tone="info">{device.status}</StatusPill>
              </label>
            ))}
          </div>
        </>
      ) : <div className="device-empty">请先选择{title}后查看可交换手机。</div>}
    </article>
  );
}
