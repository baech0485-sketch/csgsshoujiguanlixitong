"use client";

import { useEffect, useState, useTransition } from "react";
import styles from "@/components/exchange-workspace.module.css";
import { AssignmentIcon } from "@/components/icons";
import { PrimaryButton, StatusPill } from "@/components/ui";
import type { ExchangeEmployeeOption } from "@/lib/exchange-view";
import { useRouter } from "next/navigation";

function toggleCodes(current: string[], deviceCode: string, checked: boolean) {
  return checked ? [...new Set([...current, deviceCode])] : current.filter((code) => code !== deviceCode);
}

export function ExchangeWorkspace({ employees }: { employees: ExchangeEmployeeOption[] }) {
  const router = useRouter();
  const [sourceEmployeeCode, setSourceEmployeeCode] = useState(employees[0]?.employeeCode || "");
  const [targetEmployeeCode, setTargetEmployeeCode] = useState(employees[1]?.employeeCode || "");
  const [sourceDeviceCodes, setSourceDeviceCodes] = useState<string[]>([]);
  const [targetDeviceCodes, setTargetDeviceCodes] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const sourceEmployee = employees.find((item) => item.employeeCode === sourceEmployeeCode) || null;
  const targetEmployee = employees.find((item) => item.employeeCode === targetEmployeeCode) || null;

  useEffect(() => {
    if (!sourceEmployeeCode && employees[0]?.employeeCode) {
      setSourceEmployeeCode(employees[0].employeeCode);
    }
    if (!targetEmployeeCode && employees[1]?.employeeCode) {
      setTargetEmployeeCode(employees[1].employeeCode);
    }
  }, [employees, sourceEmployeeCode, targetEmployeeCode]);

  useEffect(() => {
    const validSourceCodes = new Set(sourceEmployee?.devices.map((item) => item.deviceCode) || []);
    setSourceDeviceCodes((current) => current.filter((code) => validSourceCodes.has(code)));
  }, [sourceEmployee]);

  useEffect(() => {
    const validTargetCodes = new Set(targetEmployee?.devices.map((item) => item.deviceCode) || []);
    setTargetDeviceCodes((current) => current.filter((code) => validTargetCodes.has(code)));
  }, [targetEmployee]);

  async function submitExchange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/exchanges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceEmployeeCode,
        targetEmployeeCode,
        sourceDeviceCodes,
        targetDeviceCodes,
      }),
    });
    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setMessage(payload.message || "手机交换失败");
      return;
    }

    setMessage("手机交换已完成");
    setSourceDeviceCodes([]);
    setTargetDeviceCodes([]);
    startTransition(() => router.refresh());
  }

  if (employees.length < 2) {
    return <div className="device-empty">当前至少需要两名名下存在已分配手机的在职员工，才能执行相互交换。</div>;
  }

  return (
    <form className={styles.layout} onSubmit={submitExchange}>
      <div className={styles.hero}>
        <section className={`panel ${styles.heroNote}`}>
          <h2 className="panel__title">交换规则</h2>
          <p>选择两名在职员工后，可分别勾选双方当前名下的已分配手机。提交后系统会直接更正设备责任人，并同步修正受影响的待处理流程数据。</p>
          <div className={styles.ruleList}>
            <div className={styles.ruleItem}>仅支持交换双方当前名下状态为“已分配”的手机。</div>
            <div className={styles.ruleItem}>仍处于“待领取”确认中的手机不会进入交换范围。</div>
            <div className={styles.ruleItem}>交换成功后，手机资产台账、员工管理和待处理流程页面会读取新的责任归属。</div>
          </div>
        </section>
        <section className={`panel ${styles.selectionSummary}`}>
          <h2 className="panel__title">本次选择</h2>
          <div className={styles.summaryCard}>
            <strong>员工甲已选 {sourceDeviceCodes.length} 台</strong>
            <p>{sourceEmployee ? `${sourceEmployee.name} · ${sourceEmployee.department}` : "请先选择员工甲"}</p>
          </div>
          <div className={styles.summaryCard}>
            <strong>员工乙已选 {targetDeviceCodes.length} 台</strong>
            <p>{targetEmployee ? `${targetEmployee.name} · ${targetEmployee.department}` : "请先选择员工乙"}</p>
          </div>
        </section>
      </div>

      <div className={styles.columns}>
        <article className={`panel ${styles.employeePanel}`}>
          <label className="field">
            <span>员工甲</span>
            <select aria-label="选择员工甲" value={sourceEmployeeCode} onChange={(event) => setSourceEmployeeCode(event.target.value)}>
              <option value="">请选择员工甲</option>
              {employees.map((item) => (
                <option key={item.employeeCode} value={item.employeeCode} disabled={item.employeeCode === targetEmployeeCode}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          {sourceEmployee ? (
            <>
              <div className={styles.employeeHeader}>
                <div className={styles.employeeMeta}>
                  <strong>{sourceEmployee.name}</strong>
                  <p>{sourceEmployee.employeeCode} · {sourceEmployee.department}</p>
                </div>
                <StatusPill tone="selected">已分配 {sourceEmployee.deviceCount} 台</StatusPill>
              </div>
              <div className={styles.deviceList}>
                {sourceEmployee.devices.map((device) => (
                  <label
                    key={device.deviceCode}
                    className={`${styles.deviceOption} ${sourceDeviceCodes.includes(device.deviceCode) ? styles.deviceOptionSelected : ""}`.trim()}
                  >
                    <input
                      aria-label={`勾选员工甲设备 ${device.deviceCode}`}
                      type="checkbox"
                      checked={sourceDeviceCodes.includes(device.deviceCode)}
                      onChange={(event) => setSourceDeviceCodes((current) => toggleCodes(current, device.deviceCode, event.target.checked))}
                    />
                    <div className={styles.deviceInfo}>
                      <strong>{device.deviceCode}</strong>
                      <p>{device.deviceTitle || "设备信息待同步"}</p>
                    </div>
                    <StatusPill tone="info">{device.status}</StatusPill>
                  </label>
                ))}
              </div>
            </>
          ) : <div className="device-empty">请选择员工甲后查看可交换手机。</div>}
        </article>

        <article className={`panel ${styles.employeePanel}`}>
          <label className="field">
            <span>员工乙</span>
            <select aria-label="选择员工乙" value={targetEmployeeCode} onChange={(event) => setTargetEmployeeCode(event.target.value)}>
              <option value="">请选择员工乙</option>
              {employees.map((item) => (
                <option key={item.employeeCode} value={item.employeeCode} disabled={item.employeeCode === sourceEmployeeCode}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          {targetEmployee ? (
            <>
              <div className={styles.employeeHeader}>
                <div className={styles.employeeMeta}>
                  <strong>{targetEmployee.name}</strong>
                  <p>{targetEmployee.employeeCode} · {targetEmployee.department}</p>
                </div>
                <StatusPill tone="selected">已分配 {targetEmployee.deviceCount} 台</StatusPill>
              </div>
              <div className={styles.deviceList}>
                {targetEmployee.devices.map((device) => (
                  <label
                    key={device.deviceCode}
                    className={`${styles.deviceOption} ${targetDeviceCodes.includes(device.deviceCode) ? styles.deviceOptionSelected : ""}`.trim()}
                  >
                    <input
                      aria-label={`勾选员工乙设备 ${device.deviceCode}`}
                      type="checkbox"
                      checked={targetDeviceCodes.includes(device.deviceCode)}
                      onChange={(event) => setTargetDeviceCodes((current) => toggleCodes(current, device.deviceCode, event.target.checked))}
                    />
                    <div className={styles.deviceInfo}>
                      <strong>{device.deviceCode}</strong>
                      <p>{device.deviceTitle || "设备信息待同步"}</p>
                    </div>
                    <StatusPill tone="info">{device.status}</StatusPill>
                  </label>
                ))}
              </div>
            </>
          ) : <div className="device-empty">请选择员工乙后查看可交换手机。</div>}
        </article>
      </div>

      <section className={`panel ${styles.actionPanel}`}>
        <h2 className="panel__title">执行交换</h2>
        <p>双方都至少勾选一台手机后，系统会立即对调责任人，并把待处理流程中的关联人同步到最新归属。</p>
        {message ? <p className="form-error">{message}</p> : null}
        <PrimaryButton
          type="submit"
          disabled={isPending || !sourceEmployeeCode || !targetEmployeeCode || !sourceDeviceCodes.length || !targetDeviceCodes.length}
        >
          <AssignmentIcon color="var(--text-inverse)" />
          {isPending ? "交换处理中..." : "执行相互交换"}
        </PrimaryButton>
      </section>
    </form>
  );
}
