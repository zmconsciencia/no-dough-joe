import { useEffect, useState } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { useUserStore } from '../state/user/user.state';
import { userService } from '../services/api/user.service';
import { UserProfileForm } from '../components/user/UserProfileForm';
import type { UserProfileFormValues } from '../models/user-profile.model';

export default function UserProfilePage() {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [values, setValues] = useState<UserProfileFormValues>({
    fullName: '',
    email: '',
    avatarUrl: '',
    dateOfBirth: '',
    monthlyIncome: 0,
    currency: 'EUR',
    payday: 1,
    savingsGoal: 0,
  });

  useEffect(() => {
    if (user) {
      const p = user.profile;
      if (!p) {
        return;
      }
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
      setLoaded(true);
    } else {
      userService.getMe().then((me) => {
        setUser(me);
      });
    }
  }, [user, setUser]);

  const onChange = (field: keyof UserProfileFormValues, value: string | number) => setValues((v) => ({ ...v, [field]: value }));

  const onSubmit = async () => {
    setSaving(true);
    try {
      const updated = await userService.updateMyProfile(values);
      setUser(updated);
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return <UserProfileForm values={values} onChange={onChange} onSubmit={onSubmit} saving={saving} />;
}
