import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigService } from '@nestjs/config/dist/config.service';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { TokenPayload } from '../types/jwt.token.payload';
import { UnauthorizedException } from '@nestjs/common';

export class JwtStrategy extends PassportStrategy(Strategy, 'access-token') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) =>
          req?.cookies?.access_token || req?.headers?.Authentication,
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
  validate(payload: TokenPayload) {
    if (payload === null) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
