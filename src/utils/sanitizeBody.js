const SENSETIVE_PATTERNS = [/password/i, /token/i, /secret/i];
function saniteizeBody(body) {
	if (!body || typeof body !== "object") return {};

	const clone = { ...body };
	for (const key in clone) {
		if (SENSETIVE_PATTERNS.some(regex => regex.test(key))) {
			clone[key] = "***";
		}
	}
	return clone;
}
