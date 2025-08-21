/**
 * @typedef {Object} MailMessage
 * @property {string} to
 * @property {string} subject
 * @property {string} [text]
 * @property {string} [html]
 * @property {Object} [meta]
 */

class MailService {
  /**
   * @param {MailMessage} _msg
   * @returns {Promise<void>}
   */
  async sendPasswordReset(_msg) {
    throw new Error("Not implemented");
  }

  /**
   * @param {MailMessage} _msg
   * @returns {Promise<void>}
   */
  async sendPasswordChanged(_msg) {
    throw new Error("Not implemented");
  }

  /**
   * return copy of all messages (tests only)
   * @returns {MailMessage[]}
   */
  getSent() {
    throw new Error("Not implemented");
  }

  /** clear mailbox (tests only) */
  clear() {
    throw new Error("Not implemented");
  }

  /**
   * get last message that was send to specific address (tests only)
   * @param {string} _to
   * @returns {MailMessage | undefined}
   */
  lastTo(_to) {
    throw new Error("Not implemented");
  }
}

module.exports = MailService;
