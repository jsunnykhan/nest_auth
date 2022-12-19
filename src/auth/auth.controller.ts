import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  signIn(@Body() dto: AuthDto) {
    return this.authService.signIn(dto);
  }

  @Post('/signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.signUp(dto);
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Get('refresh')
  refreshToken(@Req() req: Request) {
    const userName = req.user['userName'];
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshToken(userName, refreshToken);
  }
}
