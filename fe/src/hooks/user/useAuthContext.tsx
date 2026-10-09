import { useContext } from 'react';
import AuthenticationContext from './AuthenticationContext';

const useAuth = () => {
  const context = useContext(AuthenticationContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthenticationProvider');
  }
  return context;
};

export default useAuth;
