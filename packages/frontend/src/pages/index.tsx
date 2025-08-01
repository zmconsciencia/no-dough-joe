import { Box, Typography } from '@mui/material';
import { useUserStore } from '../state/user/user.state';

const Home = () => {
  const user = useUserStore((state) => state.user);
  return (
    <Box>
      <Typography variant="h1" component="h1" gutterBottom>
        Welcome {user?.email}
      </Typography>
    </Box>
  );
};

export default Home;
