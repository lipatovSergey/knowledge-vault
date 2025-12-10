import {
  MailService,
  PasswordChangedMessage,
  PasswordResetMessage,
  StoredMailMessage,
} from "./mail.service";

export default class InMemoryMailService extends MailService {
  private outbox: StoredMailMessage[] = [];

  async sendPasswordReset(message: PasswordResetMessage): Promise<void> {
    this.push({
      ...message,
      type: "password-reset",
      createdAt: new Date(),
    });
  }

  async sendPasswordChanged(message: PasswordChangedMessage): Promise<void> {
    this.push({
      ...message,
      type: "password-changed",
      createdAt: new Date(),
    });
  }

  getSent(): StoredMailMessage[] {
    return [...this.outbox];
  }

  clear(): void {
    this.outbox.length = 0;
  }

  lastTo(to: string): StoredMailMessage | undefined {
    for (let i = this.outbox.length - 1; i >= 0; i -= 1) {
      if (this.outbox[i]?.to === to) {
        return this.outbox[i];
      }
    }
    return undefined;
  }

  private push(message: StoredMailMessage): void {
    // Important! No logs here! Sensitive data!
    this.outbox.push(message);
  }
}
