import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, color: true, eligibleForMealTicket: true },
    });
  }

  async create(input: { name: string; color?: string; eligibleForMealTicket?: boolean }) {
    try {
      return await this.prisma.category.create({
        data: {
          name: input.name.trim(),
          color: input.color ?? '#999999',
          eligibleForMealTicket: Boolean(input.eligibleForMealTicket),
        },
        select: { id: true, name: true, color: true, eligibleForMealTicket: true },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new BadRequestException('Category name already exists');
      }
      throw e;
    }
  }
}
