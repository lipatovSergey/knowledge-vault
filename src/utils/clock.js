let getNow = () => Date.now();

function now() {
  return getNow();
}

function __setNowForTests(fn) {
  getNow = fn;
}

function __resetNowForTests() {
  getNow = () => Date.now();
}

module.exports = { now, __setNowForTests, __resetNowForTests };
