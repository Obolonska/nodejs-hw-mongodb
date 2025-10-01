function parseNumber(value, defaultValue) {
  if (typeof value === 'undefined') {
    return defaultValue;
  }
  const parsedValues = parseInt(value, 10);

  if (Number.isNaN(parsedValues)) {
    return defaultValue;
  }
  return parsedValues;
}
export function parsePaginationParams(query) {
  const { page, perPage } = query;

  const parsedPage = parseNumber(page, 1);
  const parsedPerPage = parseNumber(perPage, 10);
  return { page: parsedPage, perPage: parsedPerPage };
}
