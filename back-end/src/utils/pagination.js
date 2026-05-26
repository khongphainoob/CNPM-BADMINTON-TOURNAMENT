export function parsePagination(query, options = {}) {
  const { defaultPage = 1, defaultLimit = 20, maxLimit = 100 } = options;
  const page = Math.max(Number.parseInt(query?.page, 10) || defaultPage, 1);
  const limitRaw = Number.parseInt(query?.limit, 10) || defaultLimit;
  const limit = Math.min(Math.max(limitRaw, 1), maxLimit);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}
