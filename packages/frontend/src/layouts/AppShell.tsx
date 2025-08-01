import { AppBar, Box, Toolbar, Typography, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

export default function AppShell() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            No Dough Joey
          </Typography>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ p: 2 }}>
        <Container>
          <Outlet />
        </Container>
      </Box>
    </>
  );
}
