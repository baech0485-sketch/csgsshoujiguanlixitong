 "use client";

import { CopyLinkButton } from "@/components/copy-link-button";
import { useMemo, useState } from "react";
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
  const [search, setSearch] = useState("");
  const filteredRecords = useMemo(() => {
    const keyword = search.trim();
    if (!keyword) {
      return records;
    }
    return records.filter((item) =>
      [item.employeeName, item.employeeCode, item.deviceCode, item.deviceTitle, item.type, item.status]
        .join(" ")
        .includes(keyword),
    );
  }, [records, search]);

  return (
    <div className="employee-list">
      <p className="panel__subtitle">当前共 {totalRecords} 条记录。员工确认后会进入维修中，维修完成后会保留处理历史。</p>
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
              {item.description ? <span>{item.description}</span> : null}
            </div>
            <div className="approval-card__links">
              <CopyLinkButton label="异常确认链接" value={item.confirmUrl} />
              <span>{item.confirmedAt ? `确认时间 ${item.confirmedAt}` : "待员工确认"}</span>
            </div>
            {item.confirmationMethod ? <StatusPill tone="info">{item.confirmationMethod}</StatusPill> : null}
          </div>
        </article>
      )) : <div className="device-empty">{records.length ? "当前搜索条件下没有匹配的异常记录。" : "当前还没有异常确认记录。"}</div>}
    </div>
  );
}
