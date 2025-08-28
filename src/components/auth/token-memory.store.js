const store = new Map();

function save(email, token) {
  store.set(email, { token, createdAt: Date.now() });
  console.log(store);
}

function get(email) {
  return store.get(email);
}

function remove(email) {
  store.delete(email);
}

function clear() {
  store.clear();
}

module.exports = {
  save,
  get,
  remove,
  clear,
};
