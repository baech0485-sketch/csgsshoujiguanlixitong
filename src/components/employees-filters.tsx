"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { SearchIcon } from "@/components/icons";

export function EmployeesFilters({
  initialSearch,
  initialStatus,
  initialDepartment,
}: {
  initialSearch: string;
  initialStatus: "在职" | "离职";
  initialDepartment: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState<"在职" | "离职">(initialStatus);
  const [department, setDepartment] = useState(initialDepartment);
  const [isPending, startTransition] = useTransition();
  const initialRenderRef = useRef(true);

  function buildUrl(nextSearch: string, nextStatus: "在职" | "离职", nextDepartment: string) {
    const query = new URLSearchParams();
    const keyword = nextSearch.trim();

    if (keyword) {
      query.set("search", keyword);
    }
    if (nextStatus !== "在职") {
      query.set("status", nextStatus);
    }
    if (nextDepartment) {
      query.set("department", nextDepartment);
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
        router.replace(buildUrl(search, status, department));
      });
    }, 260);

    return () => window.clearTimeout(timer);
  }, [department, pathname, router, search, status]);

  return (
    <div className="filters-form filters-form--employees">
      <label className="filter-search">
        <span>搜索员工</span>
        <div className="filter-search__box">
          <SearchIcon color="var(--text-secondary)" />
          <input
            aria-label="搜索员工"
            value={search}
            placeholder="搜索员工编号 / 姓名"
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </label>
      <label className="filter-select filter-select--employees-status">
        <span>状态筛选</span>
        <select
          aria-label="状态筛选"
          value={status}
          onChange={(event) => setStatus(event.target.value as "在职" | "离职")}
        >
          <option value="在职">在职</option>
          <option value="离职">离职</option>
        </select>
      </label>
      <label className="filter-select filter-select--employees-department">
        <span>部门筛选</span>
        <select
          aria-label="部门筛选"
          value={department}
          onChange={(event) => setDepartment(event.target.value)}
        >
          <option value="">全部</option>
          <option value="武汉销售部">武汉销售部</option>
          <option value="宜昌销售部">宜昌销售部</option>
        </select>
      </label>
      {isPending ? <span className="panel__subtitle">筛选中...</span> : null}
    </div>
  );
}
