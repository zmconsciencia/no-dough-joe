import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Switch,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import { useState } from 'react';
import { categoryService } from '../../services/api/category.service';
import { useToast } from '../../hooks/useToast';
import { emit, EVENTS } from '../../utils/events';

type Props = { open: boolean; onClose: () => void };

export function AddCategoryDialog({ open, onClose }: Props) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#999999');
  const [eligible, setEligible] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await categoryService.createCategory({ name: name.trim(), color, eligibleForMealTicket: eligible });
      emit(EVENTS.CATEGORY_CHANGED);
      toast.success('Category created');
      onClose();
      setName('');
      setColor('#999999');
      setEligible(false);
    } catch {
      toast.error('Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Category</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField size="small" label="Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus fullWidth />
          <TextField
            size="small"
            label="Color (#RRGGBB)"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            inputProps={{ pattern: '^#([0-9A-Fa-f]{6})$' }}
            fullWidth
          />
          <FormControlLabel
            control={<Switch checked={eligible} onChange={(e) => setEligible(e.target.checked)} />}
            label="Eligible for Meal Ticket"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} size="small">
          Close
        </Button>
        <Button onClick={handleSave} variant="contained" size="small" disabled={saving || !name.trim()}>
          {saving ? <CircularProgress size={20} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
