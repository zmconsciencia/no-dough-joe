import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enGB } from 'date-fns/locale/en-GB';
import { useState } from 'react';
import { format } from 'date-fns';
import { bonusService } from '../../services/api/bonus.service';
import { useToast } from '../../hooks/useToast';
import { CURRENCY_OPTIONS } from '../../constants/currency';
import { useUserStore } from '../../state/user/user.state';
import { emit, EVENTS } from '../../utils/events';

type Props = { open: boolean; onClose: () => void };

export function BonusDialog({ open, onClose }: Props) {
  const toast = useToast();
  const currencyCode = useUserStore((s) => s.user?.profile?.currency) ?? 'EUR';
  const currencySymbol = CURRENCY_OPTIONS.find((c) => c.code === currencyCode)?.symbol ?? '€';

  const [date, setDate] = useState<Date | null>(new Date());
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const iso = (d: Date | null) => (d ? format(d, "yyyy-MM-dd'T'00:00:00.000'Z'") : '');

  const handleSave = async () => {
    if (!date || amount < 0) return;
    setSaving(true);
    try {
      await bonusService.createBonus({ date: iso(date), amount: Number(amount), note: note || undefined });
      emit(EVENTS.BONUS_CHANGED);
      toast.success('Bonus saved');
      onClose();
      setAmount(0);
      setNote('');
    } catch {
      toast.error('Failed to save bonus');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Bonus</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
            <DatePicker
              label="Date"
              value={date}
              onChange={(d) => setDate(d)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </LocalizationProvider>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} size="small">
          Close
        </Button>
        <Button onClick={handleSave} variant="contained" size="small" disabled={saving || !date}>
          {saving ? <CircularProgress size={20} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
