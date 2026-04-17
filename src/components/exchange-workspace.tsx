"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExchangeEmployeePanel } from "@/components/exchange-employee-panel";
import styles from "@/components/exchange-workspace.module.css";
import { AssignmentIcon } from "@/components/icons";
import { PrimaryButton } from "@/components/ui";
import type { ExchangeEmployeeOption } from "@/lib/exchange-view";
import type { ExchangeMode } from "@/lib/device-exchange-service";

function toggleCodes(current: string[], deviceCode: string, checked: boolean) {
  return checked ? [...new Set([...current, deviceCode])] : current.filter((code) => code !== deviceCode);
}

const modeOptions: Array<{ value: ExchangeMode; label: string; description: string }> = [
  {
    value: "bidirectional",
    label: "双向交换",
    description: "双方都勾选要互换的手机，系统会同时对调责任人。",
  },
  {
    value: "unidirectional",
    label: "单向交换",
    description: "只把员工甲勾选的手机转给员工乙，员工乙无需反选自己的手机。",
  },
];

export function ExchangeWorkspace({ employees }: { employees: ExchangeEmployeeOption[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<ExchangeMode>("bidirectional");
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
        mode,
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
    return <div className="device-empty">当前至少需要两名在职员工，才能进入手机交换工作台。</div>;
  }

  return (
    <form className={styles.layout} onSubmit={submitExchange}>
      <div className={styles.hero}>
        <section className={`panel ${styles.heroNote}`}>
          <h2 className="panel__title">交换规则</h2>
          <p>选择两名在职员工后，可按交换模式勾选双方或单方当前名下的已分配手机。提交后系统会直接更正设备责任人，并同步修正受影响的待处理流程数据。</p>
          <label className="field">
            <span>交换模式</span>
            <select aria-label="交换模式" value={mode} onChange={(event) => {
              const nextMode = event.target.value === "unidirectional" ? "unidirectional" : "bidirectional";
              setMode(nextMode);
              if (nextMode === "unidirectional") {
                setTargetDeviceCodes([]);
              }
            }}>
              <option value="bidirectional">双向交换</option>
              <option value="unidirectional">单向交换</option>
            </select>
          </label>
          <div className={styles.modeGrid}>
            {modeOptions.map((item) => (
              <label key={item.value} className={`${styles.modeCard} ${mode === item.value ? styles.modeCardSelected : ""}`.trim()}>
                <input type="radio" name="exchange-mode" checked={mode === item.value} onChange={() => {
                  setMode(item.value);
                  if (item.value === "unidirectional") {
                    setTargetDeviceCodes([]);
                  }
                }} />
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.description}</p>
                </div>
              </label>
            ))}
          </div>
          <div className={styles.ruleList}>
            <div className={styles.ruleItem}>仅支持处理双方当前名下状态为“已分配”的手机。</div>
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
            <p>{mode === "unidirectional"
              ? "单向交换时，员工乙只作为接收方。"
              : targetEmployee ? `${targetEmployee.name} · ${targetEmployee.department}` : "请先选择员工乙"}
            </p>
          </div>
        </section>
      </div>

      <div className={styles.columns}>
        <ExchangeEmployeePanel
          title="员工甲"
          selectLabel="选择员工甲"
          emptyText="请选择员工甲"
          employeeCode="source"
          selectedEmployeeCode={sourceEmployeeCode}
          blockedEmployeeCode={targetEmployeeCode}
          employees={employees}
          employee={sourceEmployee}
          selectedDeviceCodes={sourceDeviceCodes}
          onSelectEmployee={setSourceEmployeeCode}
          onToggleDevice={(deviceCode, checked) => setSourceDeviceCodes((current) => toggleCodes(current, deviceCode, checked))}
          selectableDevices
          deviceCheckboxPrefix="员工甲"
        />
        <ExchangeEmployeePanel
          title="员工乙"
          selectLabel="选择员工乙"
          emptyText="请选择员工乙"
          employeeCode="target"
          selectedEmployeeCode={targetEmployeeCode}
          blockedEmployeeCode={sourceEmployeeCode}
          employees={employees}
          employee={targetEmployee}
          selectedDeviceCodes={targetDeviceCodes}
          onSelectEmployee={setTargetEmployeeCode}
          onToggleDevice={(deviceCode, checked) => setTargetDeviceCodes((current) => toggleCodes(current, deviceCode, checked))}
          selectableDevices={mode === "bidirectional"}
          deviceCheckboxPrefix="员工乙"
          passiveHint={mode === "unidirectional" ? "单向交换时，员工乙无需勾选自己的手机。" : undefined}
        />
      </div>

      <section className={`panel ${styles.actionPanel}`}>
        <h2 className="panel__title">执行{mode === "unidirectional" ? "单向交换" : "双向交换"}</h2>
        <p>{mode === "unidirectional"
          ? "提交后会把员工甲勾选的手机全部转给员工乙，并把待处理流程中的关联人同步到最新归属。"
          : "双方都至少勾选一台手机后，系统会立即对调责任人，并把待处理流程中的关联人同步到最新归属。"}
        </p>
        {message ? <p className="form-error">{message}</p> : null}
        <PrimaryButton
          type="submit"
          disabled={isPending || !sourceEmployeeCode || !targetEmployeeCode || !sourceDeviceCodes.length || (mode === "bidirectional" && !targetDeviceCodes.length)}
        >
          <AssignmentIcon color="var(--text-inverse)" />
          {isPending ? "交换处理中..." : mode === "unidirectional" ? "执行单向交换" : "执行相互交换"}
        </PrimaryButton>
      </section>
    </form>
  );
}
