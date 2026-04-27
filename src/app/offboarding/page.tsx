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
      <DesktopShell activeHref="/offboarding" title="资产回收" subtitle="支持在职回收与离职回收，两种模式都会回收入库；离职回收会额外同步员工状态">
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
