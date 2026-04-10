"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { IncidentIcon, SearchIcon } from "@/components/icons";
import { PrimaryButton, StatusPill } from "@/components/ui";
import type { RepairQueueRow } from "@/lib/incident-management";

export function IncidentRepairQueue({ items }: { items: RepairQueueRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [pendingCode, setPendingCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const filteredItems = useMemo(() => {
    const keyword = search.trim();
    if (!keyword) {
      return items;
    }
    return items.filter((item) =>
      [item.deviceCode, item.deviceTitle, item.employeeName, item.department, item.incidentType]
        .join(" ")
        .includes(keyword),
    );
  }, [items, search]);

  async function completeRepair(assetCode: string) {
    setPendingCode(assetCode);
    setMessage("");
    const response = await fetch("/api/incidents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assetCode, action: "completeRepair" }),
    });
    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setMessage(payload.message || "维修完成更新失败");
      setPendingCode("");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <>
      <h2 className="panel__title">维修中手机列表</h2>
      <p className="panel__subtitle">用于追踪维修中的手机。修复完成后，可直接把手机状态恢复为正常使用状态。</p>
      <label className="filter-search incident-panel-search">
        <span>搜索维修手机</span>
        <div className="filter-search__box">
          <SearchIcon color="var(--text-secondary)" />
          <input
            aria-label="搜索维修手机"
            value={search}
            placeholder="搜索手机编号 / 员工姓名"
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </label>
      <div className="employee-list">
        {filteredItems.length ? filteredItems.map((item) => (
          <article key={item.deviceCode} className="employee-card">
            <div className="employee-card__avatar"><IncidentIcon color="var(--text-inverse)" /></div>
            <div className="employee-card__body">
              <div className="employee-card__top">
                <div>
                  <strong>{item.deviceCode}</strong>
                  <p>{item.deviceTitle}</p>
                </div>
                <StatusPill tone="warning">维修中</StatusPill>
              </div>
              <div className="employee-card__meta">
                <span>{item.employeeName}</span>
                <span>{item.department}</span>
                <span>{item.incidentType}</span>
                {item.confirmedAt ? <span>确认时间 {item.confirmedAt}</span> : null}
              </div>
            </div>
            <PrimaryButton onClick={() => completeRepair(item.deviceCode)} disabled={isPending && pendingCode === item.deviceCode}>
              {isPending && pendingCode === item.deviceCode ? "处理中..." : "维修完成"}
            </PrimaryButton>
          </article>
        )) : <div className="device-empty">{items.length ? "当前搜索条件下没有匹配的维修手机。" : "当前没有处于维修中的手机。"}</div>}
      </div>
      {message ? <p className="form-error">{message}</p> : null}
    </>
  );
}
