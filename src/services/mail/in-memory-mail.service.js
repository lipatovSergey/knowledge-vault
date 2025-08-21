const MailService = require("./mail.service.js");

class InMemoryMailService extends MailService {
  constructor() {
    super();
    this._outbox = [];
  }

  async sendPasswordReset(msg) {
    this._push({
      ...msg,
      type: "password reset",
      createdAt: new Date(),
    });
  }

  async sendPasswordChanged(msg) {
    this._push({
      ...msg,
      type: "password-changed",
      createdAt: new Date(),
    });
  }

  getSent() {
    return [...this._outbox];
  }

  clear() {
    this._outbox.length = 0;
  }

  lastTo(to) {
    for (let i = this._outbox.length - 1; i >= 0; i--) {
      if (this._outbox[i].to === to) return this._outbox[i];
    }
    return undefined;
  }

  _push(msg) {
    // Important! No logs here! Sensitive data!
    this._outbox.push(msg);
  }
}

module.exports = InMemoryMailService;
