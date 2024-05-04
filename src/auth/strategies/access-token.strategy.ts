import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { TokenPayload } from '../types/jwt-token.payload';

/**
 * Strategy to handle access token authentication.
 * This strategy extracts the access token from the request header as a bearer token
 * and validates it against the configured secret key and expiration date.
 */
@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'access-token',
) {
  constructor(configService: ConfigService) {
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
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
