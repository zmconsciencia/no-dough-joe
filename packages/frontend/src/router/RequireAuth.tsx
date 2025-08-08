import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { userService } from '../services/api/user.service';
import { useUserStore } from '../state/user/user.state';
import { Box, CircularProgress } from '@mui/material';

export default function RequireAuth() {
  const location = useLocation();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    let mounted = true;
    if (!user) {
      userService
        .getMe()
        .then(setUser)
        .catch(() => setUser(null))
        .finally(() => mounted && setLoading(false));
    } else {
      setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, [user, setUser]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (!useUserStore.getState().user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
