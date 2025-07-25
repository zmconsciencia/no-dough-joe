import { useAuthStore } from '../state/auth.state';

const Dashboard = () => {
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div>
      <p>Logged in with token: {token}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;
