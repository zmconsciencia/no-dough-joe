import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'dev@local.test' },
    update: {},
    create: {
      email: 'dev@local.test',
      password: 'mockpass',
      profile: {
        create: {
          fullName: 'Dev User',
          payday: 25,
          monthlyIncome: 1500,
        },
      },
    },
    include: { profile: true },
  });

  console.log('Mock user created:', user);
}
main().finally(() => prisma.$disconnect());
