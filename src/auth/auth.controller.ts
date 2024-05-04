import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginPayloadDto } from './dto/login.payload.dto';
import { Tokens } from './types/jwt-tokens.type';
import { HttpResponse } from './types/http.response';
import { ConfigService } from '@nestjs/config';
import { RegistrationPayloadDTO } from './dto/registration.payload.dto';
import { PublicResource } from 'src/common/decorators/public-resource.decorator';
import { FromCurrentUser } from 'src/common/decorators/from-current-user.decorator';
import { ExtractRefreshToken } from 'src/common/decorators/extract-refresh-token.decorator';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @PublicResource()
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
  @PublicResource()
  @HttpCode(HttpStatus.CREATED)
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

  @Post('refresh-token')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @FromCurrentUser('id') userId: number,
    @ExtractRefreshToken() refreshToken: string,
  ): Promise<HttpResponse<Tokens>> {
    const accessToken: Omit<Tokens, 'refreshToken'> =
      await this.authService.refreshToken(userId, refreshToken);
    return new HttpResponse<Tokens>(
      HttpStatus.OK,
      'Login completed successfully.',
      accessToken,
    );
  }
}
