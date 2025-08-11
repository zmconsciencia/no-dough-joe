import {
  Box,
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
import { useState } from 'react';
import { format } from 'date-fns';
import { useToast } from '../../hooks/useToast';
import { CURRENCY_OPTIONS } from '../../constants/currency';
import { useUserStore } from '../../state/user/user.state';
import { mealTicketService } from '../../services/api/mealticket.service';
import { emit, EVENTS } from '../../utils/events';

type Props = { open: boolean; onClose: () => void };

export function MealTicketDialog({ open, onClose }: Props) {
  const toast = useToast();
  const currencyCode = useUserStore((s) => s.user?.profile?.currency) ?? 'EUR';
  const currencySymbol = CURRENCY_OPTIONS.find((c) => c.code === currencyCode)?.symbol ?? '€';

  const [month, setMonth] = useState<Date | null>(new Date());
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const monthKey = (d: Date | null) => (d ? format(d, 'yyyy-MM-01') : '');

  const handleSave = async () => {
    if (!month || amount < 0) return;
    setSaving(true);
    try {
      await mealTicketService.createTopUp({ month: monthKey(month), amount: Number(amount), note: note || undefined });
      emit(EVENTS.MEALTICKET_CHANGED);
      toast.success('Meal ticket top-up saved');
      onClose();
      setAmount(0);
      setNote('');
    } catch {
      toast.error('Failed to save top-up');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Meal Ticket Top-up</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <DatePicker
              label="Month"
              views={['year', 'month']}
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
                  startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
                },
                htmlInput: { min: 0, step: 0.01 },
              }}
            />
            <TextField size="small" label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} fullWidth />
          </Stack>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} size="small">
          Close
        </Button>
        <Button onClick={handleSave} variant="contained" size="small" disabled={saving || !month}>
          {saving ? <CircularProgress size={20} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
