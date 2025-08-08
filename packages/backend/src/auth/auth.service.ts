import { PrismaService } from '../common/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(email: string, password: string) {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new BadRequestException('Email already in use');

    const hashed = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({
      data: { email, password: hashed },
      select: { id: true, email: true, createdAt: true },
    });

    await this.prisma.userProfile.create({ data: { userId: user.id } });

    return user;
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  private signTokens(userId: string, email: string) {
    const accessPayload = { sub: userId, email };
    const refreshPayload = { sub: userId, email };

    const access = this.jwt.sign(accessPayload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_TTL ?? '15m',
    });

    const refresh = this.jwt.sign(refreshPayload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_TTL ?? '7d',
    });

    return { access, refresh };
  }

  async loginAndIssueTokens(userId: string, email: string) {
    const { access, refresh } = this.signTokens(userId, email);

    const refreshHash = await bcrypt.hash(refresh, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: refreshHash },
    });

    return { access, refresh };
  }

  async revokeRefreshToken(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }
}
