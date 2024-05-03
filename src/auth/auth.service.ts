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
import { TokenPayload } from './types/jwt-token.payload';
import { Tokens } from './types/jwt-tokens.type';
import { User } from './user/schema/user.schema';
import { UserService } from './user/user.service';

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

      const passwordMatches = await bcrypt.compare(password, user.password);

      if (!passwordMatches) {
        throw new UnauthorizedException('Invalid credentials.');
      }

      const tokens: Tokens = await this.generateTokens(
        user.id,
        user.email,
        user.firstName,
        user.lastName,
      );

      res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        expires: new Date(
          Date.now() +
            this.configService.getOrThrow<number>('REFRESH_TOKEN_EXPIRATION'),
        ),
      });

      return { accessToken: tokens.accessToken };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw new UnauthorizedException('Invalid credentials.');
      } else {
        throw new InternalServerErrorException('An error occurred.');
      }
    }
  }

  async register(
    registerPayload: RegistrationPayloadDTO,
    res: Response,
  ): Promise<void> {
    try {
      const hashedPassword = await this.hashData(registerPayload.password);

      const registeredUser: User = await this.userService.create({
        ...registerPayload,
        password: hashedPassword,
      });

      const tokens: Tokens = await this.generateTokens(
        registeredUser.id,
        registeredUser.email,
        registeredUser.firstName,
        registeredUser.lastName,
      );

      res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        expires: new Date(
          Date.now() +
            this.configService.getOrThrow<number>('REFRESH_TOKEN_EXPIRATION'),
        ),
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new UnauthorizedException('Email already exists.');
      } else {
        throw new InternalServerErrorException('An error occurred.');
      }
    }
  }

  private async generateTokens(
    userId: number,
    email: string,
    firstName: string,
    lastName: string,
  ): Promise<Tokens> {
    const jwtPayload: TokenPayload = {
      subject: userId,
      email: email,
      firstName: firstName,
      lastName: lastName,
    };

    const [accessToken, refreshToken] = await Promise.all([
      // Sign access token
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.getOrThrow<string>(
          'ACCESS_TOKEN_EXPIRATION',
        ),
      }),

      // Sign refresh token
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.getOrThrow<string>(
          'REFRESH_TOKEN_EXPIRATION',
        ),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private hashData(data: string) {
    return bcrypt.hash(data);
  }
}
