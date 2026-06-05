"use client";

import Link from "next/link";
import { CopyLinkButton } from "@/components/copy-link-button";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { SearchIcon } from "@/components/icons";

export function DevicesFilters({
  initialSearch,
  initialStatus,
  initialOwner,
  initialLocation,
  owners,
  entryLink,
}: {
  initialSearch: string;
  initialStatus: string;
  initialOwner: string;
  initialLocation: string;
  owners: string[];
  entryLink: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [owner, setOwner] = useState(initialOwner);
  const [location, setLocation] = useState(initialLocation);
  const [isPending, startTransition] = useTransition();
  const initialRenderRef = useRef(true);

  function buildUrl(nextSearch: string, nextStatus: string, nextOwner: string, nextLocation: string) {
    const query = new URLSearchParams();
    const keyword = nextSearch.trim();

    if (keyword) query.set("search", keyword);
    if (nextStatus) query.set("status", nextStatus);
    if (nextOwner) query.set("owner", nextOwner);
    if (nextLocation) query.set("location", nextLocation);

    return `${pathname}${query.size ? `?${query.toString()}` : ""}`;
  }

  useEffect(() => {
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      startTransition(() => {
        router.replace(buildUrl(search, status, owner, location));
      });
    }, 260);

    return () => window.clearTimeout(timer);
  }, [location, owner, pathname, router, search, status]);

  return (
    <div className="filters-form filters-form--devices">
      <label className="filter-select">
        <span>状态</span>
        <select aria-label="状态" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">全部</option>
          {["待分配", "已分配", "修理中"].map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label className="filter-select">
        <span>责任人</span>
        <select aria-label="责任人" value={owner} onChange={(event) => setOwner(event.target.value)}>
          <option value="">全部</option>
          {owners.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label className="filter-select">
        <span>所在地</span>
        <select aria-label="所在地" value={location} onChange={(event) => setLocation(event.target.value)}>
          <option value="">全部</option>
          <option value="宜昌">宜昌</option>
          <option value="武汉">武汉</option>
        </select>
      </label>
      <label className="filter-search filter-search--devices">
        <span>搜索</span>
        <div className="filter-search__box">
          <SearchIcon color="var(--text-secondary)" />
          <input
            aria-label="搜索"
            value={search}
            placeholder="搜索 IMEI / 手机编号 / 责任人"
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </label>
      <Link className="button button--ghost" href="/devices">重置</Link>
      <div className="device-filter-actions">
        <Link className="button button--primary" href="/devices?modal=new">手机录入</Link>
        <CopyLinkButton label="复制手机录入链接" value={entryLink} variant="button" />
      </div>
      {isPending ? <span className="panel__subtitle">筛选中...</span> : null}
    </div>
  );
}
