"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { SearchIcon } from "@/components/icons";

type ApprovalStatusFilter = "全部" | "待领取" | "已领取";

export function ApprovalsFilters({
  initialSearch,
  initialStatus,
}: {
  initialSearch: string;
  initialStatus: ApprovalStatusFilter;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState<ApprovalStatusFilter>(initialStatus);
  const [isPending, startTransition] = useTransition();
  const initialRenderRef = useRef(true);

  function buildUrl(nextSearch: string, nextStatus: ApprovalStatusFilter) {
    const query = new URLSearchParams();
    const keyword = nextSearch.trim();

    if (keyword) {
      query.set("search", keyword);
    }
    if (nextStatus !== "全部") {
      query.set("status", nextStatus);
    }

    return `${pathname}${query.size ? `?${query.toString()}` : ""}`;
  }

  useEffect(() => {
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      startTransition(() => {
        router.replace(buildUrl(search, status));
      });
    }, 260);

    return () => window.clearTimeout(timer);
  }, [pathname, router, search, status]);

  return (
    <div className="filters-form filters-form--approvals">
      <label className="filter-search">
        <span>搜索员工姓名</span>
        <div className="filter-search__box">
          <SearchIcon color="var(--text-secondary)" />
          <input
            aria-label="搜索员工姓名"
            value={search}
            placeholder="输入员工姓名进行筛选"
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </label>
      <label className="filter-select filter-select--approvals-status">
        <span>领取状态</span>
        <select
          aria-label="领取状态筛选"
          value={status}
          onChange={(event) => setStatus(event.target.value as ApprovalStatusFilter)}
        >
          <option value="全部">全部</option>
          <option value="待领取">待领取</option>
          <option value="已领取">已领取</option>
        </select>
      </label>
      {isPending ? <span className="panel__subtitle">筛选中...</span> : null}
    </div>
  );
}
