import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { isInstance } from 'class-validator';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private userService: UserService,
  ) {}

  async signIn(dto: AuthDto) {
    try {
      const user = await this.userService.getUserByName(dto.username);
      if (!user) throw new ForbiddenException('Credentials incorrect');
      const passwordVerify = await argon.verify(user.hash, dto.password);
      if (!passwordVerify) throw new ForbiddenException('Password not match');
      const token = await this.signToken(user.id, user.userName);
      await this.updateRefresh(token.refreshToken, user.id.toString());
      return { ...token, tokenType: 'bearer' };
    } catch (error) {
      throw error;
    }
  }

  async signUp(dto: AuthDto) {
    try {
      const user = await this.userService.createUser(dto);
      const token = await this.signToken(user.id, user.userName);
      await this.updateRefresh(token.refreshToken, user.id.toString());
      return { ...token, tokenType: 'bearer' };
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(userName: string, refreshToken: string) {
    try {
      const user = await this.userService.getUserByName(userName);
      if (!user || !user.refreshToken)
        throw new ForbiddenException('access Denied1');
      const verifyRefresh = await argon.verify(user.refreshToken, refreshToken);
      console.log({ verifyRefresh, userName, user });
      if (!verifyRefresh) throw new ForbiddenException('access Denied');
      const token = await this.signToken(user.id, user.userName);
      await this.updateRefresh(token.refreshToken, user.id.toString());
      return token;
    } catch (error) {
      throw error;
    }
  }

  async signToken(
    userId: number,
    userName: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: userId,
      userName,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        expiresIn: '15m',
        secret: this.config.get('JWT_SECRET'),
      }),
      this.jwt.signAsync(payload, {
        expiresIn: '1h',
        secret: this.config.get('JWT_REFRESH_SECRET'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefresh(token: string, id: string) {
    const refreshToken = await argon.hash(token);
    const user = await this.userService.updateUser({ refreshToken }, id);
    console.log(user);
  }
}
