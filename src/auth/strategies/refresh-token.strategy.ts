import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config/dist/config.service';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { TokenPayload } from '../types/jwt-token.payload';

/**
 * Strategy to handle refresh token authentication.
 * This strategy extracts the refresh token from the request cookies and
 * validates it against the configured secret key and expiration date.
 */
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies?.refresh_token,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('REFRESH_TOKEN_SECRET'),
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
