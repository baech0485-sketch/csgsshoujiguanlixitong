import { DevicesPageClient } from "@/components/devices-page-client";
import { DeviceEntryModal } from "@/components/device-entry-modal";
import { DesktopShell } from "@/components/desktop-shell";
import { getOptionalNextDeviceCode } from "@/lib/device-data";
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
    location: String(params.location ?? ""),
  };
  const currentPage = normalizePageParam(String(params.page ?? ""));
  const selectedCode = String(params.selected ?? "");
  const nextDeviceCode = showModal ? await getOptionalNextDeviceCode() : "";

  return (
    <main className="page-shell">
      <DesktopShell activeHref="/devices" title="手机资产台账" subtitle="支持多条件筛选、批量操作、状态留痕与右侧详情联动">
        <DevicesPageClient
          search={filters.search}
          status={filters.status}
          owner={filters.owner}
          location={filters.location}
          page={currentPage}
          selectedCode={selectedCode}
        />
        {showModal ? <DeviceEntryModal nextDeviceCode={nextDeviceCode} warehousingDate={warehousingDate} /> : null}
      </DesktopShell>
    </main>
  );
}
