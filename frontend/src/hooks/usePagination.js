import { useMemo, useState } from 'react';

export function usePagination(items = [], pageSize = 8) {
  const [page, setPage] = useState(1);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return {
    page,
    pageSize,
    setPage,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
    pagedItems
  };
}
