import { useEffect, useState } from 'react';
import { useUserStore } from '../state/user/user.state';
import type { UserProfileFormValues } from '../models/user-profile.model';
import { userService } from '../services/api/user.service';
import { UserProfileForm } from '../components/user/UserProfileForm';

const UserProfilePage = () => {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const [saving, setSaving] = useState(false);

  const [values, setValues] = useState<UserProfileFormValues>({
    fullName: '',
    email: user?.email ?? '',
    avatarUrl: '',
    dateOfBirth: '',
    monthlyIncome: 0,
    currency: 'EUR',
    payday: 1,
    savingsGoal: 0,
  });

  useEffect(() => {
    if (!user?.profile) return;
    const p = user.profile;
    setValues({
      fullName: p.fullName ?? '',
      email: user.email,
      avatarUrl: p.avatarUrl ?? '',
      dateOfBirth: p.dateOfBirth?.slice(0, 10) ?? '',
      monthlyIncome: p.monthlyIncome ?? 0,
      currency: p.currency ?? 'EUR',
      payday: p.payday ?? 1,
      savingsGoal: p.savingsGoal ?? 0,
    });
  }, [user]);

  const onChange = (field: keyof UserProfileFormValues, value: string | number) => setValues((v) => ({ ...v, [field]: value }));

  const onSubmit = async () => {
    try {
      setSaving(true);
      const updated = await userService.updateMyProfile(values);
      setUser(updated);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  return <UserProfileForm values={values} onChange={onChange} onSubmit={onSubmit} saving={saving} />;
};

export default UserProfilePage;
