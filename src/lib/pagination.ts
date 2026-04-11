export function normalizePageParam(value: string | undefined) {
  const page = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }
  return page;
}

export function paginateItems<T>(items: T[], pageInput: number, pageSize = 10) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(Math.max(1, pageInput), totalPages);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: items.slice(start, end),
    page,
    pageSize,
    totalItems,
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages,
  };
}

export function buildServerPagination(totalItems: number, pageInput: number, pageSize = 10) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(Math.max(1, pageInput), totalPages);
  const skip = (page - 1) * pageSize;

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    skip,
    limit: pageSize,
    hasPrev: page > 1,
    hasNext: page < totalPages,
  };
}
