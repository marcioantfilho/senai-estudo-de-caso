import { Page } from '../application/pagination';

export interface PageResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total_items: number; total_pages: number };
}

export function toPageResponse<T, R>(page: Page<T>, toItem: (item: T) => R): PageResponse<R> {
  const { meta } = page;
  return {
    data: page.data.map(toItem),
    meta: { page: meta.page, limit: meta.limit, total_items: meta.totalItems, total_pages: meta.totalPages },
  };
}
