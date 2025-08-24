import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CssBaseline,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { SalaryDialog } from '../components/salary/SalaryDialog';
import { CURRENCY_OPTIONS } from '../constants/currency';
import { authService } from '../services/auth.service';
import { useUserStore } from '../state/user/user.state';
import { BonusDialog } from '../components/bonus/BonusDialog';
import { MealTicketDialog } from '../components/mealticket/MealTicketDialog';
import { AddExpenseDialog } from '../components/expenses/AddExpenseDialog';
import { AddCategoryDialog } from '../components/category/AddCategoryDialog';

const drawerWidth = 240;

const menuItems = [
  { label: 'Home', path: '/' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Profile', path: '/user-profile' },
];

export default function AppShell() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const toggleDrawer = () => setOpen((v) => !v);
  const user = useUserStore((s) => s.user);
  const [bonusOpen, setBonusOpen] = useState(false);
  const [salaryOpen, setSalaryOpen] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const currencyCode = user?.profile?.currency ?? 'EUR';
  const currencySymbol = useMemo(() => CURRENCY_OPTIONS.find((c) => c.code === currencyCode)?.symbol ?? '', [currencyCode]);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ gap: 2 }}>
          <IconButton size="large" edge="start" color="inherit" onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            No Dough Joe
          </Typography>

          {user && (
            <>
              <Button color="inherit" size="small" onClick={() => setCategoryOpen(true)}>
                Add Category
              </Button>
              <Button color="inherit" size="small" onClick={() => setExpenseOpen(true)}>
                Add Expense
              </Button>
              <Button color="inherit" size="small" onClick={() => setSalaryOpen(true)}>
                Set Salary
              </Button>
              <Button color="inherit" size="small" onClick={() => setBonusOpen(true)}>
                Add Bonus
              </Button>
              <Button color="inherit" size="small" onClick={() => setTicketOpen(true)}>
                Add Meal Ticket
              </Button>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {user.email}
              </Typography>
              <Button
                color="inherit"
                size="small"
                onClick={async () => {
                  await authService.logout();
                  navigate('/login');
                }}
              >
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Drawer variant="persistent" anchor="left" open={open} sx={{ '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}>
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton onClick={() => navigate(item.path)}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          ml: open ? `${drawerWidth}px` : 0,
          transition: (t) =>
            t.transitions.create('margin', {
              easing: t.transitions.easing.sharp,
              duration: t.transitions.duration.enteringScreen,
            }),
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
      <AddExpenseDialog open={expenseOpen} onClose={() => setExpenseOpen(false)} />
      <SalaryDialog open={salaryOpen} onClose={() => setSalaryOpen(false)} currencyCode={currencyCode} />
      <BonusDialog open={bonusOpen} onClose={() => setBonusOpen(false)} />
      <MealTicketDialog open={ticketOpen} onClose={() => setTicketOpen(false)} />
      <AddCategoryDialog open={categoryOpen} onClose={() => setCategoryOpen(false)} />
    </Box>
  );
}
