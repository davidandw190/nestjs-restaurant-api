import * as bcrypt from 'bcrypt';

import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginPayloadDto } from './dto/login.payload.dto';
import { RegistrationPayloadDTO } from './dto/registration.payload.dto';
import { Response } from 'express';
import { Tokens } from './types/jwt-tokens.type';
import { User } from './user/schema/user.schema';
import { UserService } from './user/user.service';

/**
 * Service handling authentication-related operations.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginPayload: LoginPayloadDto, res: Response): Promise<Tokens> {
    const { email, password } = loginPayload;

    try {
      const user: User = await this.userService.findByEmail(email);

      await this.validatePassword(password, user.password);

      const tokens: Tokens = await this.generateTokens(user);

      this.setRefreshTokenCookie(res, tokens.refreshToken);

      return { accessToken: tokens.accessToken };
    } catch (error) {
      this.handleAuthError(error);
    }
  }

  async register(
    registerPayload: RegistrationPayloadDTO,
    res: Response,
  ): Promise<void> {
    try {
      const hashedPassword = await this.hashPassword(registerPayload.password);

      const registeredUser: User = await this.userService.create({
        ...registerPayload,
        password: hashedPassword,
      });

      const tokens: Tokens = await this.generateTokens(registeredUser);

      this.setRefreshTokenCookie(res, tokens.refreshToken);
    } catch (error) {
      this.handleAuthError(error);
    }
  }

  async refreshToken(userId: number): Promise<Omit<Tokens, 'refreshToken'>> {
    const user: Omit<User, 'password'> =
      await this.userService.findById(userId);

    const accessToken = await this.generateAccessToken(user);

    return { accessToken };
  }

  async generateAccessToken(user: Omit<User, 'password'>): Promise<string> {
    const { id, email, firstName, lastName } = user;

    const jwtPayload = { subject: id, email, firstName, lastName };

    return this.jwtService.signAsync(jwtPayload, {
      secret: this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.getOrThrow<string>('ACCESS_TOKEN_TTL'),
    });
  }

  private async generateTokens(user: Omit<User, 'password'>): Promise<Tokens> {
    const { id, email, firstName, lastName } = user;

    const jwtPayload = { subject: id, email, firstName, lastName };

    const [accessToken, refreshToken] = await Promise.all([
      // Sign access token
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.getOrThrow<string>('ACCESS_TOKEN_TTL'),
      }),

      // Sign refresh token
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.getOrThrow<string>('REFRESH_TOKEN_TTL'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      expires: new Date(
        Date.now() + this.configService.getOrThrow<number>('REFRESH_TOKEN_TTL'),
      ),
    });
  }

  private hashPassword(password: string): Promise<string> {
    const saltRounds =
      this.configService.get<number>('PASSWORD_SALT_ROUNDS') || 10;

    return bcrypt.hash(password, saltRounds);
  }

  async validatePassword(plainPassword: string, storedPassword: string) {
    const passwordMatches = await bcrypt.compare(plainPassword, storedPassword);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials.');
    }
  }

  private handleAuthError(error: Error): void {
    if (
      error instanceof NotFoundException ||
      error instanceof UnauthorizedException
    ) {
      throw new UnauthorizedException('Invalid credentials.');
    } else if (error instanceof ConflictException) {
      throw new UnauthorizedException('Email already exists.');
    }
    throw new InternalServerErrorException('An error occurred.');
  }
}
