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

  /**
   * Validates user credentials and generates an access tokens and a refresh
   * token upon successful login. The access token is returned in the response
   * while the refresh token is set as an Http Only Cookie.
   *
   * @param loginPayload The login payload containing email and password.
   * @param res The response object to set the refresh token cookie.
   * @returns Tokens object containing only the access token.
   * @throws UnauthorizedException if credentials are invalid.
   */
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

  /**
   * Registers a new user based on the validated registration payload.
   *
   * @param registerPayload The registration payload containing user details.
   * @param res The response object to set the refresh token cookie.
   * @throws UnauthorizedException if email already exists.
   */
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

  /**
   * Clears the refresh token cookie upon logout.
   *
   * @param res The response object to clear the refresh token cookie.
   */
  async logout(res: Response) {
    return res.clearCookie('refresh_token');
  }

  /**
   * Generates a new access token with the valid refresh token.
   *
   * @param user The user object without the password field.
   * @returns A new access token.
   */
  async refreshToken(userId: number): Promise<Omit<Tokens, 'refreshToken'>> {
    const user: Omit<User, 'password'> =
      await this.userService.findById(userId);

    const accessToken = await this.generateAccessToken(user);

    return { accessToken };
  }

  /**
   * Generates a new access token based on the user's information.
   *
   * @param user The user object without the password field.
   * @returns A new access token.
   */
  private async generateAccessToken(
    user: Omit<User, 'password'>,
  ): Promise<string> {
    const { id, email, firstName, lastName } = user;

    const jwtPayload = { subject: id, email, firstName, lastName };

    return this.jwtService.signAsync(jwtPayload, {
      secret: this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.getOrThrow<string>('ACCESS_TOKEN_TTL'),
    });
  }

  /**
   * Generates access and refresh tokens for the user.
   *
   * @param user The user object without the password field.
   * @returns Tokens containing an access token and a refresh token.
   */
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

  /**
   * Attaches the refresh token as an Http Only Cookie in the response.
   *
   * @param res The response object to set the cookie.
   * @param refreshToken The refresh token to be set as a cookie.
   */
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

  /**
   * Hashes the provided password using bcrypt.
   *
   * @param password The password to be hashed.
   * @returns A hashed password.
   */
  private hashPassword(password: string): Promise<string> {
    const saltRounds =
      this.configService.get<number>('PASSWORD_SALT_ROUNDS') || 10;

    return bcrypt.hash(password, saltRounds);
  }

  private async validatePassword(
    plainPassword: string,
    storedPassword: string,
  ) {
    const passwordMatches = await bcrypt.compare(plainPassword, storedPassword);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials.');
    }
  }

  /**
   * Handles authentication-related errors and throws appropriate exceptions.
   *
   * @param error The error to be handled.
   * @throws UnauthorizedException if credentials are invalid or email already exists.
   * @throws InternalServerErrorException if an unexpected error occurs.
   */
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
