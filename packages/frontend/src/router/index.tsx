import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppShell from '../layouts/AppShell';
import Home from '../pages';
import Dashboard from '../pages/dashboard';
import Login from '../pages/login';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Home /> },
      { path: 'dashboard', element: <Dashboard /> },
    ],
  },
  { path: '/login', element: <Login /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
