/**
 * Represents the payload of an access token.
 */
export class TokenPayload {
  constructor(
    readonly subject: number,
    readonly email: string,
    readonly firstName: string,
    readonly lastName: string,
  ) {}
}
