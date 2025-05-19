import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { isUserLoggedIn } from '../utils/auth';
import { FcGoogle } from 'react-icons/fc';
import toast, { Toaster } from 'react-hot-toast';
import { FaHome } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      if (isUserLoggedIn()) {
        navigate('/');
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleOAuthLogin = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="absolute top-4 left-4 flex items-center">
        <Link to="/" className="text-blue-400 hover:text-blue-300 flex items-center">
          <FaHome className="mr-1" />
          Home
        </Link>
        <span className="mx-2 text-gray-300">/</span>
        <span className="text-gray-200">Login</span>
      </div>
      <div className="p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8 text-white">Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Login
          </button>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-300">Not registered yet?</p>
            <button
              onClick={() => navigate('/signup')}
              className="mt-2 w-full flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Account
            </button>
          </div>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-300">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <button
              onClick={() => handleOAuthLogin('google')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 items-center gap-2"
            >
              <FcGoogle className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
