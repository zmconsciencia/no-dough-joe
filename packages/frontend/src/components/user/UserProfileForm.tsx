import { TextField, Button, InputAdornment, MenuItem, Box, Typography, Stack, CircularProgress } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enGB } from 'date-fns/locale/en-GB';
import { format } from 'date-fns';

import type { UserProfileFormValues } from '../../models/user-profile.model';
import { use, useEffect, useState } from 'react';

const currencyOptions = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
] as const;

type Props = {
  values: UserProfileFormValues;
  onChange: (field: keyof UserProfileFormValues, value: string | number) => void;
  onSubmit: () => void;
  saving: boolean;
};

export const UserProfileForm = ({ values, onChange, onSubmit, saving }: Props) => {
  const initialValues: UserProfileFormValues = {
    fullName: values.fullName || '',
    email: values.email || '',
    avatarUrl: values.avatarUrl || '',
    dateOfBirth: values.dateOfBirth || '',
    monthlyIncome: values.monthlyIncome || 0,
    currency: values.currency || 'EUR',
    payday: values.payday || 1,
    savingsGoal: values.savingsGoal || 0,
  };
  const currencySymbol = currencyOptions.find((c) => c.code === values.currency)?.symbol ?? '';
  const dobDate: Date | null = values.dateOfBirth ? new Date(values.dateOfBirth) : null;
  const [disable, setDisable] = useState(false);

  useEffect(() => {
    console.log('aqui');
    setDisable(JSON.stringify(initialValues) === JSON.stringify(values));
    console.log('disable', disable, initialValues, values);
  }, [values]);

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(initialValues == values, initialValues, values);
        onSubmit();
      }}
      sx={{ px: 2, py: 4, width: '100%', maxWidth: 600, mx: 'auto' }}
      noValidate
    >
      <Stack spacing={4}>
        <Box>
          <Typography variant="h6" gutterBottom>
            User Information
          </Typography>
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
                onChange={(newVal) => onChange('dateOfBirth', newVal ? format(newVal, 'yyyy-MM-dd') : '')}
                slotProps={{
                  textField: { fullWidth: true, required: true, size: 'small' },
                }}
              />
            </LocalizationProvider>
          </Stack>
        </Box>
        <Box>
          <Typography variant="h6" gutterBottom>
            Financial Information
          </Typography>
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
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            Preferences
          </Typography>
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
              {currencyOptions.map((c) => (
                <MenuItem key={c.code} value={c.code}>
                  {c.code} — {c.name}
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
        </Box>
        <Box display="flex" justifyContent="flex-end">
          <Button type="submit" variant="outlined" size="small" disabled={disable}>
            {saving ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};
