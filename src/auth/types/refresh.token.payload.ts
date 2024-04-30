import { TokenPayload } from './jwt.token.payload';

export class RefreshTokenPayload extends TokenPayload {
  constructor(
    readonly subject: number,
    readonly email: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly refreshToken: string,
  ) {
    super(subject, email, firstName, lastName);
  }
}
