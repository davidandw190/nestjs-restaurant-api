import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigService } from '@nestjs/config/dist/config.service';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { TokenPayload } from '../types/jwt-token.payload';
import { UnauthorizedException } from '@nestjs/common';

/**
 * Strategy to handle access token authentication.
 * This strategy extracts the access token from the request cookies and
 * validates it against the configured secret key and expiration date.
 */
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'access-token',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.access_token,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET'),
    });
  }

  /**
   * Validates the payload extracted from the access token.
   *
   * @param payload - Payload extracted from the access token.
   * @returns Validated payload.
   */
  validate(payload: TokenPayload): TokenPayload {
    if (payload === null) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
