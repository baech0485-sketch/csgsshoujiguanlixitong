import { EmployeesFilters } from "@/components/employees-filters";
import { PaginationNav } from "@/components/pagination-nav";
import { EmployeesManager } from "@/components/employees-manager";
import { DesktopShell } from "@/components/desktop-shell";
import { getEmployeesViewByDepartment, getEmployeeSummary, getNextEmployeeCode } from "@/lib/employee-data";
import { normalizePageParam, paginateItems } from "@/lib/pagination";

type EmployeesPageProps = {
  searchParams?: Promise<{
    search?: string;
    page?: string;
    status?: string;
    department?: string;
  }>;
};

export default async function EmployeesPage({ searchParams }: EmployeesPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const search = params?.search?.trim() || "";
  const status = params?.status?.trim() === "离职" ? "离职" : "在职";
  const department = params?.department?.trim() === "宜昌销售部" || params?.department?.trim() === "武汉销售部"
    ? params.department.trim()
    : "";
  const nextEmployeeCode = await getNextEmployeeCode();
  const [employees, summary] = await Promise.all([
    getEmployeesViewByDepartment(search, status, department),
    getEmployeeSummary(),
  ]);
  const paginated = paginateItems(employees, normalizePageParam(params?.page), 10);
  const baseQuery = new URLSearchParams();
  if (search) baseQuery.set("search", search);
  if (status) baseQuery.set("status", status);
  if (department) baseQuery.set("department", department);

  return (
    <main className="page-shell">
      <DesktopShell activeHref="/employees" title="员工管理" subtitle="所有员工统一建档，领用分配与离职回收都从这里读取员工数据">
        <section className="panel filters-panel">
          <EmployeesFilters initialSearch={search} initialStatus={status} initialDepartment={department} />
        </section>
        <EmployeesManager
          visibleEmployees={paginated.items}
          nextEmployeeCode={nextEmployeeCode}
          summary={summary}
        />
        <PaginationNav
          page={paginated.page}
          totalPages={paginated.totalPages}
          totalItems={paginated.totalItems}
          pageSize={paginated.pageSize}
          hrefForPage={(page) => {
            const query = new URLSearchParams(baseQuery);
            if (page > 1) query.set("page", String(page));
            return `/employees${query.size ? `?${query.toString()}` : ""}`;
          }}
        />
      </DesktopShell>
    </main>
  );
}
