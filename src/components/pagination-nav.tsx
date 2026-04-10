import Link from "next/link";

type PaginationNavProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hrefForPage: (page: number) => string;
};

function getVisiblePages(page: number, totalPages: number) {
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  const correctedStart = Math.max(1, end - 4);
  return Array.from({ length: end - correctedStart + 1 }, (_, index) => correctedStart + index);
}

export function PaginationNav({
  page,
  totalPages,
  totalItems,
  pageSize,
  hrefForPage,
}: PaginationNavProps) {
  if (totalItems <= pageSize) {
    return null;
  }

  const pages = getVisiblePages(page, totalPages);

  return (
    <nav className="pagination-nav" aria-label="分页导航">
      <div className="pagination-nav__summary">共 {totalItems} 条，第 {page} / {totalPages} 页</div>
      <div className="pagination-nav__controls">
        {page > 1 ? <Link href={hrefForPage(page - 1)} className="pagination-nav__link">上一页</Link> : <span className="pagination-nav__link is-disabled">上一页</span>}
        {pages.map((item) => item === page ? (
          <span key={item} className="pagination-nav__link is-active">{item}</span>
        ) : (
          <Link key={item} href={hrefForPage(item)} className="pagination-nav__link">{item}</Link>
        ))}
        {page < totalPages ? <Link href={hrefForPage(page + 1)} className="pagination-nav__link">下一页</Link> : <span className="pagination-nav__link is-disabled">下一页</span>}
      </div>
    </nav>
  );
}
