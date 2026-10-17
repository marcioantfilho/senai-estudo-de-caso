export interface PageRequest {
  page: number;
  limit: number;
}

export interface PageMeta extends PageRequest {
  totalItems: number;
  totalPages: number;
}

export interface Page<T> {
  data: T[];
  meta: PageMeta;
}

/** RN07: paginação depois de buscar, filtrar e ordenar; página além da última vem vazia. */
export function paginate<T>(items: readonly T[], { page, limit }: PageRequest): Page<T> {
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    meta: { page, limit, totalItems: items.length, totalPages: Math.ceil(items.length / limit) },
  };
}
