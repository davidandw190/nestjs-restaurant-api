import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigService } from '@nestjs/config/dist/config.service';
import { PassportStrategy } from '@nestjs/passport';
import { TokenPayload } from '../types/jwt-token.payload';
import { UnauthorizedException } from '@nestjs/common';

/**
 * Strategy to handle access token authentication.
 * This strategy extracts the access token from the request header as a bearer token
 * and validates it against the configured secret key and expiration date.
 */
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'access-token',
) {
  constructor(private readonly configService: ConfigService) {
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
