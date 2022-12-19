import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

import { ApplicationModule } from './application/application.module';

import { UserModule } from './user/user.module';
import { JwtStrategy, RefreshTokenStrategy } from './auth/strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PrismaModule,
    ApplicationModule,
    UserModule,
  ],
  controllers: [],
  providers: [JwtStrategy, RefreshTokenStrategy],
})
export class AppModule {}
