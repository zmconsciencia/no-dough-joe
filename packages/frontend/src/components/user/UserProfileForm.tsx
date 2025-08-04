import { TextField, Button, InputAdornment, MenuItem, Box, Typography, Stack, CircularProgress } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enGB } from 'date-fns/locale/en-GB';
import { format } from 'date-fns';
import { useRef, useMemo, useCallback } from 'react';
import { useToast } from '../../hooks/useToast';
import type { UserProfileFormValues } from '../../models/user-profile.model';
import { CURRENCY_OPTIONS } from '../../constants/currency';


type Props = {
  values: UserProfileFormValues;
  onChange: (field: keyof UserProfileFormValues, value: string | number) => void;
  onSubmit: () => Promise<void>;
  saving: boolean;
};

export function UserProfileForm({ values, onChange, onSubmit, saving }: Props) {
  const toast = useToast();
  const initialRef = useRef<UserProfileFormValues>(structuredClone(values));
  const isPristine = useMemo(() => JSON.stringify(values) === JSON.stringify(initialRef.current), [values]);

  const currencySymbol = CURRENCY_OPTIONS.find((c) => c.code === values.currency)?.symbol ?? '';

  const dobDate = values.dateOfBirth ? new Date(values.dateOfBirth) : null;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        await onSubmit();
        toast.success('Profile saved');
        initialRef.current = structuredClone(values);
      } catch {
        toast.error('Failed to save profile');
      }
    },
    [onSubmit, toast, values],
  );

  const handleReset = useCallback(() => {
    Object.entries(initialRef.current).forEach(([k, v]) => onChange(k as keyof UserProfileFormValues, v as string | number));
  }, [onChange]);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ px: 2, py: 4, width: '100%', maxWidth: 600, mx: 'auto' }} noValidate>
      <Stack spacing={4}>
        <Section title="User Information">
          <Stack spacing={2}>
            <TextField
              size="small"
              label="Full Name"
              fullWidth
              required
              autoComplete="name"
              value={values.fullName}
              onChange={(e) => onChange('fullName', e.target.value)}
            />
            <TextField
              size="small"
              label="Email"
              fullWidth
              required
              autoComplete="email"
              type="email"
              value={values.email}
              onChange={(e) => onChange('email', e.target.value)}
            />
            <TextField
              size="small"
              label="Avatar URL"
              placeholder="https://..."
              type="url"
              fullWidth
              autoComplete="photo"
              value={values.avatarUrl}
              onChange={(e) => onChange('avatarUrl', e.target.value)}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
              <DatePicker
                label="Date of Birth"
                value={dobDate}
                maxDate={new Date()}
                onChange={(d) => onChange('dateOfBirth', d ? format(d, 'yyyy-MM-dd') : '')}
                slotProps={{ textField: { fullWidth: true, required: true, size: 'small' } }}
              />
            </LocalizationProvider>
          </Stack>
        </Section>

        <Section title="Financial Information">
          <Stack spacing={2}>
            <TextField
              size="small"
              type="number"
              label="Monthly Income"
              fullWidth
              required
              slotProps={{
                input: {
                  startAdornment: currencySymbol && <InputAdornment position="start">{currencySymbol}</InputAdornment>,
                },
                htmlInput: { min: 0, step: 0.01 },
              }}
              value={values.monthlyIncome}
              onChange={(e) => onChange('monthlyIncome', +e.target.value)}
            />
            <TextField
              size="small"
              type="number"
              label="Savings Goal"
              fullWidth
              required
              slotProps={{
                input: {
                  startAdornment: currencySymbol && <InputAdornment position="start">{currencySymbol}</InputAdornment>,
                },
                htmlInput: { min: 0, step: 0.01 },
              }}
              value={values.savingsGoal}
              onChange={(e) => onChange('savingsGoal', +e.target.value)}
            />
          </Stack>
        </Section>

        <Section title="Preferences">
          <Stack spacing={2}>
            <TextField
              size="small"
              select
              label="Currency"
              fullWidth
              required
              value={values.currency}
              onChange={(e) => onChange('currency', e.target.value)}
            >
              {CURRENCY_OPTIONS.map((c) => (
                <MenuItem key={c.code} value={c.code}>
                  {c.code} – {c.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              type="number"
              label="Payday (1–31)"
              fullWidth
              required
              slotProps={{ htmlInput: { min: 1, max: 31 } }}
              value={values.payday}
              onChange={(e) => onChange('payday', +e.target.value)}
            />
          </Stack>
        </Section>

        <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
          {!isPristine && (
            <Button variant="contained" size="small" onClick={handleReset}>
              Reset
            </Button>
          )}
          <Button type="submit" variant="outlined" size="small" disabled={saving || isPristine}>
            {saving ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {children}
    </Box>
  );
}
