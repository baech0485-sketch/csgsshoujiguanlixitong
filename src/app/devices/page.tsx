import Image from "next/image";
import Link from "next/link";
import { AssetStatusPill } from "@/components/asset-status-pill";
import { PaginationNav } from "@/components/pagination-nav";
import { DevicesFilters } from "@/components/devices-filters";
import { DeviceEntryModal } from "@/components/device-entry-modal";
import { DesktopShell } from "@/components/desktop-shell";
import { Panel, PrimaryButton } from "@/components/ui";
import { getNextDeviceCode } from "@/lib/device-data";
import { formatBeijingDateTime } from "@/lib/date-time";
import { buildDeviceMongoQuery, inferBrand, type DeviceFilters, type DeviceListRow } from "@/lib/device-listing";
import { getDevicesCollection } from "@/lib/mongodb";
import { buildServerPagination, normalizePageParam } from "@/lib/pagination";

type DevicesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function mapDeviceRow(row: Record<string, unknown>): DeviceListRow {
  return {
    code: String(row.assetCode ?? ""),
    model: `${String(row.brand ?? "")} ${String(row.model ?? "")} / ${String(row.storage ?? "")}`.trim(),
    owner: row.currentOwner ? String(row.currentOwner) : "库存",
    status: String(row.status ?? "待分配"),
    date: formatBeijingDateTime(row.updatedAt ? String(row.updatedAt) : ""),
    tone: "selected",
    brand: String(row.brand ?? ""),
    photoDataUrl: row.photoDataUrl ? String(row.photoDataUrl) : "",
  };
}

async function getDevicePageData(filters: DeviceFilters, pageInput: number, selectedCode: string) {
  try {
    const devices = await getDevicesCollection();
    const query = buildDeviceMongoQuery(filters);
    const totalItems = await devices.countDocuments(query);
    const pagination = buildServerPagination(totalItems, pageInput, 10);
    const rows = await devices
      .find(query)
      .sort({ updatedAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .toArray();
    const ownerRows = await devices
      .aggregate([
        {
          $project: {
            owner: {
              $cond: [
                { $or: [{ $eq: ["$currentOwner", null] }, { $eq: ["$currentOwner", ""] }] },
                "库存",
                "$currentOwner",
              ],
            },
          },
        },
        { $group: { _id: "$owner" } },
        { $sort: { _id: 1 } },
      ])
      .toArray();
    const selectedRow = selectedCode ? await devices.findOne({ assetCode: selectedCode }) : null;

    return {
      rows: rows.map((row) => mapDeviceRow(row as Record<string, unknown>)),
      owners: ownerRows.map((row) => String(row._id ?? "")).filter(Boolean),
      selectedRow: selectedRow ? mapDeviceRow(selectedRow as Record<string, unknown>) : null,
      pagination,
    };
  } catch {
    return {
      rows: [] as DeviceListRow[],
      owners: [] as string[],
      selectedRow: null,
      pagination: buildServerPagination(0, pageInput, 10),
    };
  }
}

export default async function DevicesPage({ searchParams }: DevicesPageProps) {
  const params = await searchParams;
  const showModal = params.modal === "new";
  const warehousingDate = new Date().toISOString().slice(0, 10);
  const filters = {
    search: String(params.search ?? ""),
    status: String(params.status ?? ""),
    owner: String(params.owner ?? ""),
  };
  const currentPage = normalizePageParam(String(params.page ?? ""));
  const selectedCode = String(params.selected ?? "");
  const { rows, owners, selectedRow, pagination } = await getDevicePageData(
    { ...filters, brand: "" },
    currentPage,
    selectedCode,
  );
  const nextDeviceCode = showModal ? await getNextDeviceCode() : "";
  const paginated = {
    ...pagination,
    items: rows,
  };
  const visibleRows = paginated.items;
  const selected = visibleRows.find((row) => row.code === selectedCode) || selectedRow || visibleRows[0] || null;
  const queryBase = new URLSearchParams();
  if (filters.search) queryBase.set("search", filters.search);
  if (filters.status) queryBase.set("status", filters.status);
  if (filters.owner) queryBase.set("owner", filters.owner);

  return (
    <main className="page-shell">
      <DesktopShell activeHref="/devices" title="手机资产台账" subtitle="支持多条件筛选、批量操作、状态留痕与右侧详情联动">
        <Panel className="filters-panel">
          <DevicesFilters
            initialSearch={filters.search}
            initialStatus={filters.status}
            initialOwner={filters.owner}
            owners={owners}
            entryLink="/m/device-entry"
          />
        </Panel>
        <section className="device-grid">
          <Panel title="设备列表" subtitle={`当前共 ${paginated.totalItems} 条记录 · 每页 10 条`} className="device-table-panel">
            <div className="device-table__head"><span>手机编号</span><span>设备信息</span><span>责任人</span><span>状态</span><span>更新时间</span></div>
            <div className="device-table__body">
              {visibleRows.length ? visibleRows.map((row) => {
                const query = new URLSearchParams(queryBase);
                query.set("selected", row.code);
                if (paginated.page > 1) query.set("page", String(paginated.page));
                return (
                <Link key={row.code} href={`/devices?${query.toString()}`} className={`device-row${selected?.code === row.code ? " is-highlight" : ""}`}>
                  <span>{row.code}</span><span>{row.model}</span><span>{row.owner}</span>
                  <span><AssetStatusPill status={row.status} /></span>
                  <span>{row.date}</span>
                </Link>
              );}) : <div className="device-empty">暂无匹配设备，请调整筛选条件或先录入手机资产。</div>}
            </div>
            <PaginationNav
              page={paginated.page}
              totalPages={paginated.totalPages}
              totalItems={paginated.totalItems}
              pageSize={paginated.pageSize}
              hrefForPage={(page) => {
                const query = new URLSearchParams(queryBase);
                if (page > 1) query.set("page", String(page));
                return `/devices${query.size ? `?${query.toString()}` : ""}`;
              }}
            />
          </Panel>
          <Panel title="设备速览" subtitle="与表格联动显示当前选中设备" className="device-side-panel">
            <div className="device-hero-box">
              {selected?.photoDataUrl ? <Image src={selected.photoDataUrl} alt="设备图片" fill unoptimized className="device-hero-box__image" /> : null}
            </div>
            <div className="device-side-panel__info">
              {selected ? (
                <>
                  <p>{selected.model.split("/")[0]?.trim() || selected.model}</p>
                  <p>{selected.model.split("/")[1]?.trim() || selected.brand || inferBrand(selected.model)}</p>
                  <p>手机编号：{selected.code}</p>
                  <p>当前责任人：{selected.owner}</p>
                  <div className="device-side-panel__status-row">
                    <span>当前状态：</span>
                    <AssetStatusPill status={selected.status} />
                  </div>
                </>
              ) : (
                <>
                  <p>当前暂无设备数据</p>
                  <p>请先通过右上角“手机录入”按钮录入设备</p>
                </>
              )}
            </div>
            <div className="device-side-panel__actions">
              {selected ? (
                <PrimaryButton href={`/devices/${selected.code}`}>查看完整详情</PrimaryButton>
              ) : (
                <button className="button button--ghost" type="button" disabled>暂无详情</button>
              )}
            </div>
          </Panel>
        </section>
        {showModal ? <DeviceEntryModal nextDeviceCode={nextDeviceCode} warehousingDate={warehousingDate} /> : null}
      </DesktopShell>
    </main>
  );
}
