"use client";

import { useEffect, useMemo, useState } from "react";
import { DeviceStatusCards } from "@/components/device-status-cards";
import { DeviceWorkspace } from "@/components/device-workspace";
import { DevicesFilters } from "@/components/devices-filters";
import { Panel } from "@/components/ui";
import { buildDeviceStatusCards } from "@/lib/device-status-summary";
import type { DevicePageDataResult } from "@/lib/device-page-data";

type DevicesPageClientProps = {
  search: string;
  status: string;
  owner: string;
  location: string;
  page: number;
  selectedCode: string;
};

const loadingStatusCards = buildDeviceStatusCards({
  total: 0,
  pending: 0,
  assigned: 0,
  repairing: 0,
});

function buildPageDataUrl({
  search,
  status,
  owner,
  location,
  page,
  selectedCode,
}: DevicesPageClientProps) {
  const query = new URLSearchParams();
  if (search) query.set("search", search);
  if (status) query.set("status", status);
  if (owner) query.set("owner", owner);
  if (location) query.set("location", location);
  if (page > 1) query.set("page", String(page));
  if (selectedCode) query.set("selected", selectedCode);
  return `/api/devices/page-data${query.size ? `?${query.toString()}` : ""}`;
}

function buildQueryBase(search: string, status: string, owner: string, location: string) {
  const query = new URLSearchParams();
  if (search) query.set("search", search);
  if (status) query.set("status", status);
  if (owner) query.set("owner", owner);
  if (location) query.set("location", location);
  return query.toString();
}

export function DevicesPageClient(props: DevicesPageClientProps) {
  const { location, owner, page, search, selectedCode, status } = props;
  const [data, setData] = useState<DevicePageDataResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadSeed, setReloadSeed] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setErrorMessage("");

    fetch(buildPageDataUrl({ search, status, owner, location, page, selectedCode }), {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("云数据库数据同步失败");
        }

        const payload = (await response.json()) as DevicePageDataResult;
        setData(payload);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error("加载设备页数据失败", error);
        setErrorMessage("云数据库连接较慢或当前请求失败，请重新同步设备数据。");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [location, owner, page, reloadSeed, search, selectedCode, status]);

  const queryBase = useMemo(
    () => buildQueryBase(search, status, owner, location),
    [location, owner, search, status],
  );

  const visibleData = data ?? {
    rows: [],
    owners: [],
    selectedRow: null,
    pagination: {
      page,
      pageSize: 10,
      totalItems: 0,
      totalPages: 1,
      skip: 0,
      limit: 10,
      hasPrev: false,
      hasNext: false,
    },
    statusCards: loadingStatusCards,
  };

  return (
    <>
      <DeviceStatusCards items={visibleData.statusCards} />
      {isLoading ? (
        <Panel title="云数据库加载中" subtitle="已进入手机资产页，正在同步设备台账、状态卡片和右侧速览。">
          <div className="db-status-card">
            <span className="db-status-badge">
              <i className="db-status-dot" />
              云数据库加载中
            </span>
            <div className="device-empty">数据返回后会直接填充当前页面，无需重新进入手机资产。</div>
          </div>
        </Panel>
      ) : null}
      {errorMessage ? (
        <Panel title="云数据库同步失败" subtitle="这次请求没有拿到设备数据，但页面已经进入，可直接重试。">
          <div className="device-empty">{errorMessage}</div>
          <div className="device-side-panel__actions">
            <button className="button button--primary" type="button" onClick={() => setReloadSeed((current) => current + 1)}>
              重新同步
            </button>
          </div>
        </Panel>
      ) : null}
      <Panel className="filters-panel">
        <DevicesFilters
          initialSearch={search}
          initialStatus={status}
          initialOwner={owner}
          initialLocation={location}
          owners={visibleData.owners}
          entryLink="/m/device-entry"
        />
      </Panel>
      <DeviceWorkspace
        rows={visibleData.rows}
        selected={visibleData.selectedRow || visibleData.rows[0] || null}
        page={visibleData.pagination.page}
        pageSize={visibleData.pagination.pageSize}
        totalItems={visibleData.pagination.totalItems}
        totalPages={visibleData.pagination.totalPages}
        queryBase={queryBase}
        isLoading={isLoading}
        emptyMessage={isLoading ? "云数据库数据加载中，请稍候。" : "暂无匹配设备，请调整筛选条件或先录入手机资产。"}
      />
    </>
  );
}
