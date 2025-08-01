import type { UserProfileFormValues } from '../../models/user-profile.model';
import type { User } from '../../models/user.model';
import { useUserStore } from '../../state/user/user.state';
import { httpService } from '../httpService';

const baseURL = import.meta.env.VITE_API_URL;

const getMe = async () => {
  return httpService.get<User>('api/user/me', { baseURL });
};

const updateMyProfile = async (payload: UserProfileFormValues) => {
  const body = {
    ...payload,
    dateOfBirth: payload.dateOfBirth || undefined,
  };
  return httpService.put<User>('api/user/me', body, { baseURL });
};

const initMe = async () => {
  try {
    const me = await getMe();
    useUserStore.getState().setUser(me);
  } catch (error) {
    console.error('Failed to initialize user profile:', error);
    useUserStore.getState().setUser(null);
  }
};

export const userService = {
  initMe,
  getMe,
  updateMyProfile,
};
