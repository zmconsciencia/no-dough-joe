export interface UserProfile {
  id: string;
  fullName?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  currency: string;
  payday?: number;
  savingsGoal?: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
}
