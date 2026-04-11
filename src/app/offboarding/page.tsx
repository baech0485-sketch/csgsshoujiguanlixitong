import { DesktopShell } from "@/components/desktop-shell";
import { OffboardingManager } from "@/components/offboarding-manager";
import { PaginationNav } from "@/components/pagination-nav";
import { getOffboardingPageView } from "@/lib/offboarding-view";
import { normalizePageParam } from "@/lib/pagination";

type OffboardingPageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

export default async function OffboardingPage({ searchParams }: OffboardingPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const { employees, cases } = await getOffboardingPageView(normalizePageParam(params?.page), 10);

  return (
    <main className="page-shell">
      <DesktopShell activeHref="/offboarding" title="离职回收" subtitle="选择在职员工后自动查看名下手机，生成归还确认链接，员工确认后会自动回收入库并同步离职状态">
        <OffboardingManager employees={employees} cases={cases.items} totalCases={cases.totalItems} />
        <PaginationNav
          page={cases.page}
          totalPages={cases.totalPages}
          totalItems={cases.totalItems}
          pageSize={cases.pageSize}
          hrefForPage={(page) => `/offboarding${page > 1 ? `?page=${page}` : ""}`}
        />
      </DesktopShell>
    </main>
  );
}
