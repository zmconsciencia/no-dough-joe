import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppShell from '../layouts/AppShell';
import Home from '../pages';
import Dashboard from '../pages/dashboard';
import Login from '../pages/login';
import Register from '../pages/register';
import UserProfilePage from '../pages/UserProfilePage';
import RequireAuth from './RequireAuth';

const router = createBrowserRouter([
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <AppShell />,
        children: [
          { index: true, element: <Home /> },
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'user-profile', element: <UserProfilePage /> },
        ],
      },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
