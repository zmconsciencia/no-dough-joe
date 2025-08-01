import { useEffect } from 'react';
import { AppRouter } from './router';
import { userService } from './services/api/user.service';

const App = () => {
  useEffect(() => {
    userService.initMe();
  }, []);
  return <AppRouter />;
};

export default App;
