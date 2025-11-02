const DEFAULT_PATTERNS = [/password/i, /token/i, /secret/i];
const MASK = "***";

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export interface SanitizeOptions {
  patterns?: RegExp[];
  mask?: string;
}

export function sanitizeBody(
  payload: unknown,
  { patterns = DEFAULT_PATTERNS, mask = MASK }: SanitizeOptions = {},
): Record<string, unknown> | unknown[] | string {
  if (isPlainObject(payload)) {
    const clone: Record<string, unknown> = { ...payload };
    for (const key of Object.keys(clone)) {
      if (patterns.some((regex) => regex.test(key))) {
        clone[key] = mask;
      }
    }
    return clone;
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => sanitizeBody(item, { patterns, mask }));
  }

  return typeof payload === "string" ? payload : JSON.stringify(payload);
}
