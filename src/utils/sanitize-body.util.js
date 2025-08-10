const SENSITIVE_PATTERNS = [/password/i, /token/i, /secret/i];
function sanitizeBody(body) {
  if (!body || typeof body !== "object") return {};

  const clone = { ...body };
  for (const key in clone) {
    if (SENSITIVE_PATTERNS.some((regex) => regex.test(key))) {
      clone[key] = "***";
    }
  }
  return clone;
}

module.exports = sanitizeBody;
