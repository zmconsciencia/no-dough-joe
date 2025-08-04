import { Box, IconButton, Paper, Typography, Dialog, DialogContent } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseIcon from '@mui/icons-material/Close';
import { useState, type ReactNode } from 'react';
import { DIALOG_MAX_WIDTH, DIALOG_MAX_HEIGHT } from '../../constants/charts';

type ChartCardProps = {
  id: string;
  title: string;
  children: ReactNode;
  ratio?: number;
};

const ChartCard = ({ id, title, children, ratio = 3 }: ChartCardProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Paper id={id} elevation={3} sx={{ p: 2, width: 1 }}>
        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', cursor: 'grab' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <DragIndicatorIcon fontSize="small" />
            <Typography variant="subtitle1">{title}</Typography>
          </Box>
          <IconButton size="small" onPointerDown={(e) => e.stopPropagation()} onClick={() => setOpen(true)}>
            <FullscreenIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ width: '100%', aspectRatio: `${ratio} / 1`, minHeight: 0 }}>{children}</Box>
      </Paper>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth={false}
        slotProps={{
          paper: {
            sx: {
              position: 'fixed',
              width: DIALOG_MAX_WIDTH,
              height: DIALOG_MAX_HEIGHT,
              borderRadius: 2,
              overflow: 'hidden',
            },
          },
        }}
      >
        <DialogContent sx={{ p: 0, height: '100%', overflow: 'auto' }}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">{title}</Typography>
              <IconButton size="small" onPointerDown={(e) => e.stopPropagation()} onClick={() => setOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Box sx={{ flexGrow: 1, p: 2, minHeight: 0 }}>{children}</Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChartCard;
