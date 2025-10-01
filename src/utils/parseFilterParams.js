function parseIsFavourite(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}
function parseContactType(value) {
  const allowedTypes = ['work', 'home', 'personal'];
  if (typeof value !== 'string') return;
  if (allowedTypes.includes(value)) return value;
  return;
}

export function parseFilterParams(query) {
  const { isFavourite, type } = query;

  const parsedIsFavourite = parseIsFavourite(isFavourite);
  const parsedType = parseContactType(type);

  return {
    isFavourite: parsedIsFavourite,
    type: parsedType,
  };
}
