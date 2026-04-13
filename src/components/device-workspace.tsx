"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AssetStatusPill } from "@/components/asset-status-pill";
import { PaginationNav } from "@/components/pagination-nav";
import { DevicePreviewPanel } from "@/components/device-preview-panel";
import { Panel } from "@/components/ui";
import { formatBeijingDateTime } from "@/lib/date-time";
import type { DeviceListRow } from "@/lib/device-listing";

type DeviceWorkspaceProps = {
  rows: DeviceListRow[];
  selected: DeviceListRow | null;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  queryBase: string;
};

type DeviceRoutePayload = {
  assetCode?: string;
  brand?: string;
  model?: string;
  storage?: string;
  currentOwner?: string;
  status?: string;
  updatedAt?: string;
  photoDataUrl?: string;
};

function buildSelectionHref(queryBase: string, code: string, page: number) {
  const query = new URLSearchParams(queryBase);
  query.set("selected", code);
  if (page > 1) query.set("page", String(page));
  return `/devices?${query.toString()}`;
}

function buildPageHref(queryBase: string, page: number) {
  const query = new URLSearchParams(queryBase);
  if (page > 1) query.set("page", String(page));
  return `/devices${query.size ? `?${query.toString()}` : ""}`;
}

function mapPreviewPayload(payload: DeviceRoutePayload): DeviceListRow {
  const photoDataUrl = payload.photoDataUrl ? String(payload.photoDataUrl) : undefined;

  return {
    code: String(payload.assetCode ?? ""),
    model: `${String(payload.brand ?? "")} ${String(payload.model ?? "")} / ${String(payload.storage ?? "")}`.trim(),
    owner: payload.currentOwner ? String(payload.currentOwner) : "库存",
    status: String(payload.status ?? "待分配"),
    date: formatBeijingDateTime(payload.updatedAt ? String(payload.updatedAt) : ""),
    tone: "selected",
    brand: String(payload.brand ?? ""),
    photoDataUrl,
  };
}

function isModifiedEvent(event: React.MouseEvent<HTMLAnchorElement>) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

export function DeviceWorkspace({
  rows,
  selected: initialSelected,
  page,
  pageSize,
  totalItems,
  totalPages,
  queryBase,
}: DeviceWorkspaceProps) {
  const [selected, setSelected] = useState<DeviceListRow | null>(initialSelected);
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const pendingRequestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setSelected(initialSelected);
    setPendingCode(null);
    pendingRequestRef.current?.abort();
    pendingRequestRef.current = null;
  }, [initialSelected]);

  useEffect(() => () => {
    pendingRequestRef.current?.abort();
  }, []);

  async function handleSelect(
    event: React.MouseEvent<HTMLAnchorElement>,
    row: DeviceListRow,
    href: string,
  ) {
    if (isModifiedEvent(event)) return;

    event.preventDefault();
    window.history.replaceState(window.history.state, "", href);

    if (row.code === selected?.code && selected.photoDataUrl) {
      setPendingCode(null);
      return;
    }

    pendingRequestRef.current?.abort();
    const controller = new AbortController();
    pendingRequestRef.current = controller;
    setPendingCode(row.code);
    setSelected((current) => {
      if (current?.code === row.code && current.photoDataUrl) {
        return current;
      }

      return {
        ...row,
        photoDataUrl: "",
      };
    });

    try {
      const response = await fetch(`/api/devices/${encodeURIComponent(row.code)}`, {
        signal: controller.signal,
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("加载设备速览失败");
      }

      const payload = (await response.json()) as DeviceRoutePayload;
      setSelected(mapPreviewPayload(payload));
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error("加载设备速览失败", error);
      setSelected({
        ...row,
        photoDataUrl: "",
      });
    } finally {
      if (pendingRequestRef.current === controller) {
        pendingRequestRef.current = null;
        setPendingCode(null);
      }
    }
  }

  const activeCode = pendingCode || selected?.code || "";

  return (
    <section className="device-grid">
      <Panel title="设备列表" subtitle={`当前共 ${totalItems} 条记录 · 每页 10 条`} className="device-table-panel">
        <div className="device-table__head"><span>手机编号</span><span>设备信息</span><span>责任人</span><span>状态</span><span>更新时间</span></div>
        <div className="device-table__body">
          {rows.length ? rows.map((row) => {
            const href = buildSelectionHref(queryBase, row.code, page);
            return (
              <Link
                key={row.code}
                href={href}
                prefetch={false}
                onClick={(event) => void handleSelect(event, row, href)}
                className={`device-row${activeCode === row.code ? " is-highlight" : ""}`}
              >
                <span>{row.code}</span><span>{row.model}</span><span>{row.owner}</span>
                <span><AssetStatusPill status={row.status} /></span>
                <span>{row.date}</span>
              </Link>
            );
          }) : <div className="device-empty">暂无匹配设备，请调整筛选条件或先录入手机资产。</div>}
        </div>
        <PaginationNav
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          hrefForPage={(nextPage) => buildPageHref(queryBase, nextPage)}
        />
      </Panel>
      <DevicePreviewPanel selected={selected} isLoading={Boolean(pendingCode)} />
    </section>
  );
}
