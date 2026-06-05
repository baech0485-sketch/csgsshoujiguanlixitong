"use client";

import { CopyLinkButton } from "@/components/copy-link-button";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { IncidentIcon, SearchIcon } from "@/components/icons";
import { StatusPill } from "@/components/ui";
import type { IncidentRecordRow } from "@/lib/incident-management";

function tone(status: string) {
  if (status === "已修复") return "success";
  if (status === "已确认") return "warning";
  return "danger";
}

export function IncidentRecordList({
  records,
  totalRecords,
}: {
  records: IncidentRecordRow[];
  totalRecords: number;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [localRecords, setLocalRecords] = useState(records);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLocalRecords(records);
  }, [records]);

  const filteredRecords = useMemo(() => {
    const keyword = search.trim();
    if (!keyword) {
      return localRecords;
    }
    return localRecords.filter((item) =>
      [item.employeeName, item.employeeCode, item.deviceCode, item.deviceTitle, item.location, item.type, item.status]
        .join(" ")
        .includes(keyword),
    );
  }, [localRecords, search]);

  async function deleteRecord(id: string) {
    const confirmed = window.confirm("确认删除这条待员工确认的异常记录吗？");
    if (!confirmed) return;

    setMessage("");
    const response = await fetch(`/api/incidents/${id}`, {
      method: "DELETE",
    });
    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setMessage(payload.message || "删除异常确认记录失败");
      return;
    }

    setLocalRecords((current) => current.filter((item) => item.id !== id));
    startTransition(() => router.refresh());
  }

  return (
    <div className="employee-list">
      <p className="panel__subtitle">当前共 {totalRecords} 条记录。员工确认后会进入维修中，维修完成后会保留处理历史。</p>
      {message ? <p className="form-error">{message}</p> : null}
      <label className="filter-search incident-panel-search">
        <span>搜索异常记录</span>
        <div className="filter-search__box">
          <SearchIcon color="var(--text-secondary)" />
          <input
            aria-label="搜索异常记录"
            value={search}
            placeholder="搜索员工 / 手机编号 / 异常类型"
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </label>
      {filteredRecords.length ? filteredRecords.map((item) => (
        <article key={item.id} className="employee-card">
          <div className="employee-card__avatar"><IncidentIcon color="var(--text-inverse)" /></div>
          <div className="employee-card__body">
            <div className="employee-card__top">
              <div>
                <strong>{item.employeeName}</strong>
                <p>{item.employeeCode} · {item.deviceCode}</p>
              </div>
              <StatusPill tone={tone(item.status)}>{item.status}</StatusPill>
            </div>
            <div className="employee-card__meta">
              <span>{item.type}</span>
              <span>{item.deviceTitle}</span>
              <span>所在地 {item.location}</span>
              {item.description ? <span>{item.description}</span> : null}
            </div>
            <div className="approval-card__links">
              <CopyLinkButton label="异常确认链接" value={item.confirmUrl} />
              <span>{item.confirmedAt ? `确认时间 ${item.confirmedAt}` : "待员工确认"}</span>
            </div>
            <div className="approval-card__links">
              {item.confirmationMethod ? <StatusPill tone="info">{item.confirmationMethod}</StatusPill> : <span />}
              {item.status === "待员工确认" ? (
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => void deleteRecord(item.id)}
                  disabled={isPending}
                >
                  {isPending ? "删除中..." : "删除记录"}
                </button>
              ) : null}
            </div>
          </div>
        </article>
      )) : <div className="device-empty">{localRecords.length ? "当前搜索条件下没有匹配的异常记录。" : "当前还没有异常确认记录。"}</div>}
    </div>
  );
}
