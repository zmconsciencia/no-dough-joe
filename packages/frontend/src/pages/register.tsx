import { useState, useCallback } from 'react';
import { Box, Paper, Stack, TextField, Button, Typography, Alert, Link } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { userService } from '../services/api/user.service';

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setBusy(true);
      setErr(null);
      try {
        await authService.register(email.trim(), password);
        await authService.login(email.trim(), password);
        await userService.initMe(); // fetch user & profile
        navigate('/dashboard', { replace: true });
      } catch (e: any) {
        setErr(e?.message || 'Failed to register');
      } finally {
        setBusy(false);
      }
    },
    [email, password, navigate],
  );

  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100dvh', px: 2 }}>
      <Paper elevation={3} sx={{ width: '100%', maxWidth: 420, p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Create your account
        </Typography>

        {err && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {err}
          </Alert>
        )}

        <Box component="form" onSubmit={submit}>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              size="small"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              autoComplete="new-password"
              size="small"
              required
              slotProps={{ htmlInput: { minLength: 8 } }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" variant="contained" disabled={busy}>
              {busy ? 'Creating…' : 'Create account'}
            </Button>
          </Stack>
        </Box>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" underline="hover">
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}

export default Register;