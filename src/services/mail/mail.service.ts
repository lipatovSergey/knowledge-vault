export type MailMeta = Record<string, unknown>;

export interface MailMessage {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  meta?: MailMeta;
}

export type PasswordResetMessage = MailMessage;
export type PasswordChangedMessage = MailMessage;

export type OutboxMessageType = "password-reset" | "password-changed";

export interface StoredMailMessage extends MailMessage {
  type: OutboxMessageType;
  createdAt: Date;
}

export abstract class MailService {
  abstract sendPasswordReset(message: PasswordResetMessage): Promise<void>;
  abstract sendPasswordChanged(message: PasswordChangedMessage): Promise<void>;
  abstract getSent(): StoredMailMessage[];
  abstract clear(): void;
  abstract lastTo(to: string): StoredMailMessage | undefined;
}

