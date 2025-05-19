import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isUserLoggedIn } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      setLoading(true);
      const isLoggedInResult = isUserLoggedIn();
      setLoggedIn(isLoggedInResult);
      if (isLoggedInResult) {
        navigate('/');
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }

  return !loggedIn ? children : null;
};

export default ProtectedRoute; 