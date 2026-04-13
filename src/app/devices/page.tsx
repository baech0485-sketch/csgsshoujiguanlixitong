import { DeviceStatusCards } from "@/components/device-status-cards";
import { DeviceWorkspace } from "@/components/device-workspace";
import { DevicesFilters } from "@/components/devices-filters";
import { DeviceEntryModal } from "@/components/device-entry-modal";
import { DesktopShell } from "@/components/desktop-shell";
import { Panel } from "@/components/ui";
import { getOptionalNextDeviceCode } from "@/lib/device-data";
import { getDevicePageData } from "@/lib/device-page-data";
import { normalizePageParam } from "@/lib/pagination";

type DevicesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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
  const { rows, owners, selectedRow, pagination, statusCards } = await getDevicePageData(
    { ...filters, brand: "" },
    currentPage,
    selectedCode,
  );
  const nextDeviceCode = showModal ? await getOptionalNextDeviceCode() : "";
  const queryBase = new URLSearchParams();
  if (filters.search) queryBase.set("search", filters.search);
  if (filters.status) queryBase.set("status", filters.status);
  if (filters.owner) queryBase.set("owner", filters.owner);

  return (
    <main className="page-shell">
      <DesktopShell activeHref="/devices" title="手机资产台账" subtitle="支持多条件筛选、批量操作、状态留痕与右侧详情联动">
        <DeviceStatusCards items={statusCards} />
        <Panel className="filters-panel">
          <DevicesFilters
            initialSearch={filters.search}
            initialStatus={filters.status}
            initialOwner={filters.owner}
            owners={owners}
            entryLink="/m/device-entry"
          />
        </Panel>
        <DeviceWorkspace
          rows={rows}
          selected={selectedRow || rows[0] || null}
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
          queryBase={queryBase.toString()}
        />
        {showModal ? <DeviceEntryModal nextDeviceCode={nextDeviceCode} warehousingDate={warehousingDate} /> : null}
      </DesktopShell>
    </main>
  );
}
