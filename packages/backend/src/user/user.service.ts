import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import type { RequestUser } from 'src/common/types/request-user.interface';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ensures both User and UserProfile exist for the mocked user,
   * then returns the full user with embedded profile.
   */
  async getOrCreateMe(user: RequestUser) {
    const result = await this.prisma.$transaction(async (tx) => {
      const userRecord = await tx.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          email: user.email,
          password: 'mockpass',
        },
      });

      await tx.userProfile.upsert({
        where: { userId: userRecord.id },
        update: {},
        create: {
          userId: userRecord.id,
          fullName: 'Mock Admin',
          avatarUrl: 'https://i.pravatar.cc/150?img=1',
          dateOfBirth: new Date('1990-01-01'),
          monthlyIncome: 2500,
          currency: 'EUR',
          payday: 25,
          savingsGoal: 5000,
        },
      });

      return tx.user.findUnique({
        where: { id: userRecord.id },
        include: { profile: true },
      });
    });

    return result;
  }

  /**
   * Updates (or creates) the user's profile, then returns full user with profile.
   */
  async updateProfileAndReturnUser(userId: string, dto: UpdateUserProfileDto) {
    await this.prisma.user.upsert({
      where: { id: userId },
      update: { email: dto.email },
      create: {
        id: userId,
        email: dto.email ? dto.email : 'dev@mock.local',
        password: 'mockpass',
      },
    });

    await this.prisma.userProfile.upsert({
      where: { userId },
      update: {
        fullName: dto.fullName,
        avatarUrl: dto.avatarUrl,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        monthlyIncome: dto.monthlyIncome,
        currency: dto.currency,
        payday: dto.payday,
        savingsGoal: dto.savingsGoal,
      },
      create: {
        userId,
        fullName: dto.fullName,
        avatarUrl: dto.avatarUrl,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        monthlyIncome: dto.monthlyIncome ?? 0,
        currency: dto.currency ?? 'EUR',
        payday: dto.payday ?? 1,
        savingsGoal: dto.savingsGoal ?? 0,
      },
    });

    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
  }
}
