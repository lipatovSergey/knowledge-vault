type TokenEntry = { token: string; createdAt: number };

const store = new Map<string, TokenEntry>();

export function save(email: string, token: string): void {
  store.set(email, { token, createdAt: Date.now() });
}

export function get(email: string): TokenEntry | undefined {
  return store.get(email);
}

export function remove(email: string): void {
  store.delete(email);
}

export function clear(): void {
  store.clear();
}
