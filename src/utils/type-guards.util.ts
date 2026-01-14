type MongoDuplicateKeyError = {
  name?: string;
  code?: number;
  keyPattern?: { email?: unknown };
  keyValue?: { email?: unknown };
};

export function isMongoDuplicateEmailError(error: unknown): error is MongoDuplicateKeyError {
  if (typeof error !== "object" || error === null) return false;

  const e = error as Record<string, unknown>;

  if (e["code"] !== 11000) return false;

  const keyPattern = e["keyPattern"] as Record<string, unknown> | undefined;
  const keyValue = e["keyValue"] as Record<string, unknown> | undefined;

  return Boolean(keyPattern?.["email"] || keyValue?.["email"]);
}
