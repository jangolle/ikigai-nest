interface Address {
  name: string;
  address: string;
}

interface Context {
  [name: string]: any;
}

interface EmailContent {
  subject: string;
  template: Template<any>;
}

export interface EmailSendOptions {
  routing: RouteDetails;
  content: EmailContent;
}

export type SendEmailResult = any;

export interface RouteDetails {
  to: string | Address | Array<string | Address>;
  cc?: string | Address | Array<string | Address>;
  bcc?: string | Address | Array<string | Address>;
  replyTo?: string | Address;
  inReplyTo?: string | Address;
  from?: string | Address;
}

export abstract class Template<T extends Context> {
  readonly name: string;
  constructor(readonly context: T) {}
}

export interface EmailSender {
  sendEmail(options: EmailSendOptions): Promise<SendEmailResult>;
}
