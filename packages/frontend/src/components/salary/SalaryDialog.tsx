import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  InputAdornment,
  Typography,
  CircularProgress,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enGB } from 'date-fns/locale/en-GB';
import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { salaryService } from '../../services/api/salary.service';
import type { SalaryMonth } from '../../models/salary.model';
import { useToast } from '../../hooks/useToast';
import { CURRENCY_OPTIONS } from '../../constants/currency';
import { emit, EVENTS } from '../../utils/events';

type Props = { open: boolean; onClose: () => void; currencyCode?: string };

export function SalaryDialog({ open, onClose, currencyCode = 'EUR' }: Props) {
  const toast = useToast();
  const [month, setMonth] = useState<Date | null>(new Date());
  const [amount, setAmount] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState<SalaryMonth | null>(null);

  const currencySymbol = CURRENCY_OPTIONS.find((c) => c.code === currencyCode)?.symbol ?? '';

  const monthKey = (d: Date | null) => (d ? format(d, 'yyyy-MM-01') : '');
  const niceMonth = useMemo(() => (month ? format(month, 'MMMM yyyy') : ''), [month]);

  useEffect(() => {
    if (!open || !month) return;
    const run = async () => {
      try {
        const s = await salaryService.getCurrentSalary(monthKey(month));
        setCurrent(s);
        setAmount(s ? s.amount : 0);
      } catch {
        setCurrent(null);
      }
    };
    run();
  }, [open, month]);

  const handleSave = async () => {
    if (!month || amount < 0) return;
    setSaving(true);
    try {
      await salaryService.setSalary({ month: monthKey(month), amount: Number(amount) });
      emit(EVENTS.SALARY_CHANGED);
      toast.success(`Salary set for ${niceMonth} → Dec`);
      onClose();
    } catch {
      toast.error('Failed to set salary');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Set Net Salary (applies until year end)</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {niceMonth
              ? `Current for ${niceMonth}: ${current ? `${Number(current.amount).toFixed(2)} ${currencySymbol}` : '—'}`
              : 'Pick a month'}
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
            <Stack direction="row" spacing={2} alignItems="center">
              <DatePicker
                label="Effective Month"
                views={['month']}
                value={month}
                onChange={(d) => setMonth(d)}
                slotProps={{ textField: { size: 'small' } }}
              />
              <TextField
                size="small"
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(+e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: currencySymbol && <InputAdornment position="start">{currencySymbol}</InputAdornment>,
                  },
                  htmlInput: { min: 0, step: 0.01 },
                }}
              />
              <Button onClick={handleSave} variant="contained" size="small" disabled={saving || !month}>
                {saving ? <CircularProgress size={20} /> : 'Save'}
              </Button>
            </Stack>
          </LocalizationProvider>

          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Saving will set this amount from the selected month through December of that year.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} size="small">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
