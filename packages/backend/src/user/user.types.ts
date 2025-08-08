import type { User, UserProfile } from '@prisma/client';

export type AuthUser = { id: string; email: string };
export type UserWithProfile = User & { profile: UserProfile | null };
