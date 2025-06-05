declare module 'zeptomail' {
  export class SendMailClient {
    constructor(config: { url: string; token: string });
    // TODO types for sendMail payload
    sendMail(payload: unknown): Promise<unknown>;
  }
}
