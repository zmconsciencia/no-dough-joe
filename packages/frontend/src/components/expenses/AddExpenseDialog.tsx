import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  InputAdornment,
  MenuItem,
  Switch,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enGB } from 'date-fns/locale/en-GB';
import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useToast } from '../../hooks/useToast';
import { CURRENCY_OPTIONS } from '../../constants/currency';
import { useUserStore } from '../../state/user/user.state';
import { categoryService } from '../../services/api/category.service';
import { expenseService } from '../../services/api/expense.service';
import { recurringService } from '../../services/api/recurring.service';
import { emit, EVENTS } from '../../utils/events';
import { Category } from '../../models/category.model';

type Props = { open: boolean; onClose: () => void };

export function AddExpenseDialog({ open, onClose }: Props) {
  const toast = useToast();
  const currencyCode = useUserStore((s) => s.user?.profile?.currency) ?? 'EUR';
  const currencySymbol = useMemo(() => CURRENCY_OPTIONS.find((c) => c.code === currencyCode)?.symbol ?? '€', [currencyCode]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<Date | null>(new Date());
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [useMealTicket, setUseMealTicket] = useState<boolean>(true);

  const [repeatMonthly, setRepeatMonthly] = useState<boolean>(false);

  const [loadingCats, setLoadingCats] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingCats(true);
    categoryService
      .listMyCategories()
      .then((res) => {
        setCategories(res);
        if (!categoryId && res.length) setCategoryId(res[0].id);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoadingCats(false));
  }, [open]);

  useEffect(() => {
    const cat = categories.find((c) => c.id === categoryId);
    setUseMealTicket(!!cat?.eligibleForMealTicket);
  }, [categoryId, categories]);

  const isoDate = (d: Date | null) => (d ? format(d, "yyyy-MM-dd'T'00:00:00.000'Z'") : '');

  const monthISO = (d: Date | null) => (d ? format(d, 'yyyy-MM-01') : '');

  const handleSave = async () => {
    if (!categoryId || !date || amount <= 0) return;
    setSaving(true);
    try {
      let recurringSeriesId: string | undefined;

      if (repeatMonthly) {
        const dayOfMonth = date.getUTCDate();
        const rs = await recurringService.createRecurring({
          categoryId,
          recurrence: 'MONTHLY',
          amount: Number(amount),
          startDate: isoDate(date),
          dayOfMonth,
          note: description || undefined,
        });
        recurringSeriesId = rs.id;
        emit(EVENTS.RECURRING_CHANGED);
      }

      await expenseService.createExpense({
        categoryId,
        date: isoDate(date),
        amount: Number(amount),
        description: description || undefined,
        recurringSeriesId,
        payWithMealTicket: useMealTicket,
      });
      emit(EVENTS.EXPENSE_CHANGED);

      toast.success('Expense saved');
      onClose();
      setAmount(0);
      setDescription('');
    } catch {
      toast.error('Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Expense</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              size="small"
              label="Category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={loadingCats}
              fullWidth
            >
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            <DatePicker
              label="Date"
              value={date}
              onChange={(d) => setDate(d)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
              maxDate={new Date()} // block future dates if you want
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
                htmlInput: { min: 0.01, step: 0.01 },
              }}
              fullWidth
            />

            <TextField
              size="small"
              label="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
            />

            <FormControlLabel
              control={<Switch checked={useMealTicket} onChange={(e) => setUseMealTicket(e.target.checked)} />}
              label="Use meal ticket (if available)"
            />

            <FormControlLabel
              control={<Switch checked={repeatMonthly} onChange={(e) => setRepeatMonthly(e.target.checked)} />}
              label="Repeat monthly"
            />
          </Stack>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} size="small">
          Close
        </Button>
        <Button onClick={handleSave} variant="contained" size="small" disabled={saving || !categoryId || !date || amount <= 0}>
          {saving ? <CircularProgress size={20} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
