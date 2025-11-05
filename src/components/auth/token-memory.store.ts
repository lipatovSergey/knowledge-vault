type TokenEntry = { token: string; createdAt: number };

const store = new Map<string, TokenEntry>();

function save(email: string, token: string): void {
  store.set(email, { token, createdAt: Date.now() });
}

function get(email: string): TokenEntry | undefined {
  return store.get(email);
}

function remove(email: string): void {
  store.delete(email);
}

function clear(): void {
  store.clear();
}

export = {
  save,
  get,
  remove,
  clear,
};
