import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginPayloadDto } from './dto/login.payload.dto';
import { Tokens } from './types/jwt-tokens.type';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user/schema/user.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { TokenPayload } from './types/jwt-token.payload';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginPayload: LoginPayloadDto, res: Response): Promise<Tokens> {
    const { email, password } = loginPayload;

    const user = await this.userModel.findOne({ email }).select('+password');

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

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
