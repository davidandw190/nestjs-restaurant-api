import {
  TOKEN_AUDIENCE,
  TOKEN_ISSUER,
  TOKEN_SIGN_ALGORITHM,
} from './constants/auth.constants';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [
    JwtModule.register({
      signOptions: {
        issuer: TOKEN_ISSUER,
        audience: TOKEN_AUDIENCE,
        algorithm: TOKEN_SIGN_ALGORITHM,
      },
    }),
    UserModule,
  ],
})
export class AuthModule {}
