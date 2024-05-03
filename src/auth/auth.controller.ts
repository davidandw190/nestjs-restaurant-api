import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginPayloadDto } from './dto/login.payload.dto';
import { Tokens } from './types/jwt-tokens.type';
import { HttpResponse } from './types/http.response';
import { ConfigService } from '@nestjs/config';
import { RegistrationPayloadDTO } from './dto/registration.payload.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginPayload: LoginPayloadDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<HttpResponse<Tokens>> {
    const accessToken: Omit<Tokens, 'refreshToken'> =
      await this.authService.login(loginPayload, res);

    return new HttpResponse<Tokens>(
      HttpStatus.OK,
      'Login completed successfully.',
      accessToken,
    );
  }

  @Post('register')
  async register(
    @Body() registerPayload: RegistrationPayloadDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<HttpResponse> {
    await this.authService.register(registerPayload, res);

    return new HttpResponse(
      HttpStatus.CREATED,
      'Registration completed successfully.',
    );
  }
}
