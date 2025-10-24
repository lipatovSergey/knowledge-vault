class MailService {
  async sendPasswordReset(_msg) {
    throw new Error("Not implemented");
  }

  async sendPasswordChanged(_msg) {
    throw new Error("Not implemented");
  }

  getSent() {
    throw new Error("Not implemented");
  }

  /** clear mailbox (tests only) */
  clear() {
    throw new Error("Not implemented");
  }

  lastTo(_to) {
    throw new Error("Not implemented");
  }
}

module.exports = MailService;
