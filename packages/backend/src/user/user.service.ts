import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import type { UserWithProfile } from './user.types';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string): Promise<UserWithProfile | null> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      if (!existing) throw new NotFoundException('User not found');

      if (!existing.profile) {
        await tx.userProfile.create({ data: { userId } });
      }

      return tx.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });
    });
  }

  async updateProfileAndReturnUser(
    userId: string,
    dto: UpdateUserProfileDto,
  ): Promise<UserWithProfile | null> {
    return this.prisma.$transaction(async (tx) => {
      if (dto.email) {
        const other = await tx.user.findUnique({ where: { email: dto.email } });
        if (other && other.id !== userId) {
          throw new BadRequestException('Email already in use');
        }
        await tx.user.update({
          where: { id: userId },
          data: { email: dto.email },
        });
      }

      const profile = await tx.userProfile.findUnique({ where: { userId } });
      if (!profile) {
        await tx.userProfile.create({ data: { userId } });
      }

      const dob =
        dto.dateOfBirth !== undefined ? new Date(dto.dateOfBirth) : undefined;
      if (dob !== undefined && Number.isNaN(dob.getTime())) {
        throw new BadRequestException('Invalid dateOfBirth');
      }

      await tx.userProfile.update({
        where: { userId },
        data: {
          fullName: dto.fullName,
          avatarUrl: dto.avatarUrl,
          dateOfBirth: dob,
          monthlyIncome: dto.monthlyIncome,
          currency: dto.currency,
          payday: dto.payday,
          savingsGoal: dto.savingsGoal,
        },
      });

      return tx.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });
    });
  }
}
