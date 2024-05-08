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
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { CurrentUserId } from 'src/common/decorators/current-user-id.decorator';

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
  @PublicResource()
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @CurrentUserId() userId: number,
  ): Promise<HttpResponse<Tokens>> {
    const accessToken: Omit<Tokens, 'refreshToken'> =
      await this.authService.refreshToken(userId);
    return new HttpResponse<Tokens>(
      HttpStatus.OK,
      'Login completed successfully.',
      accessToken,
    );
  }

  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Res({ passthrough: true }) res: Response,
  ): Promise<HttpResponse> {
    this.authService.logout(res);
    return new HttpResponse(HttpStatus.OK, 'Logout completed successfully.');
  }
}
