import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import type { CookieOptions } from 'express';

function getSameSite(isProd: boolean): CookieOptions['sameSite'] {
  return isProd ? 'none' : 'lax';
}

function cookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    sameSite: getSameSite(isProd),
    secure: isProd,
    path: '/',
  };
}

type AuthUser = { id: string; email: string };

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly jwt: JwtService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.auth.register(dto.email, dto.password);
    return user;
  }

  @Public()
  @HttpCode(200)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.auth.validateUser(dto.email, dto.password);
    const { access, refresh } = await this.auth.loginAndIssueTokens(
      user.id,
      user.email,
    );

    res.cookie('refresh_token', refresh, cookieOptions());
    return { accessToken: access };
  }

  @Public()
  @HttpCode(200)
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as AuthUser; // typed; no any
    const { access, refresh } = await this.auth.loginAndIssueTokens(
      user.id,
      user.email,
    );
    res.cookie('refresh_token', refresh, cookieOptions());
    return { accessToken: access };
  }

  @HttpCode(200)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', { path: '/' });
    return { ok: true };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  me(@Req() req: Request) {
    const user = req.user as AuthUser;
    return { id: user.id, email: user.email };
  }
}
