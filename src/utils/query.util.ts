export function normalizeFields<Allowed extends readonly string[]>(
  raw: string | string[],
  allowedFields: Allowed,
): Allowed[number][] {
  // in case if fields wasn't passed at all
  const values = Array.isArray(raw) ? raw : raw.split(",");
  const allowedSet = new Set(allowedFields);
  const isAllowed = (v: string): v is Allowed[number] => allowedSet.has(v as Allowed[number]);
  const normalized = Array.from(new Set(values.map((v) => v.trim()).filter(isAllowed)));
  return normalized;
}
