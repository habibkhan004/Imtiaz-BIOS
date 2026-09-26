/** Shared pagination for large list APIs (§16 NFR). */
export type PageParams = {
  page: number;
  limit: number;
  offset: number;
};

export function parsePageParams(
  searchParams: URLSearchParams,
  defaultLimit = 25,
  maxLimit = 100,
): PageParams {
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1);
  const limit = Math.min(
    maxLimit,
    Math.max(1, Number(searchParams.get("limit") || defaultLimit) || defaultLimit),
  );
  return { page, limit, offset: (page - 1) * limit };
}

export function paginate<T>(items: T[], params: PageParams) {
  const total = items.length;
  const slice = items.slice(params.offset, params.offset + params.limit);
  return {
    items: slice,
    total,
    page: params.page,
    limit: params.limit,
    totalPages: Math.max(1, Math.ceil(total / params.limit)),
  };
}
