import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { PrismaService } from '../../common/prisma.service';
import * as bcrypt from 'bcrypt';

type JwtPayload = { sub: string; email: string };
type AuthUser = { id: string; email: string };

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly prisma: PrismaService) {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not set');
    }

    const opts: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies?.['refresh_token'],
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    };

    super(opts);
  }

  async validate(req: Request, payload: JwtPayload): Promise<AuthUser> {
    const token = req.cookies?.['refresh_token'];
    if (!token) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException();
    }

    const ok = await bcrypt.compare(token, user.refreshTokenHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return { id: payload.sub, email: payload.email };
  }
}
