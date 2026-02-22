import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { isUserLoggedIn } from '../utils/auth';
import { FcGoogle } from 'react-icons/fc';
import toast, { Toaster } from 'react-hot-toast';
import { ThreeDots } from 'react-loader-spinner';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [signupLoading, setSignupLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      if (isUserLoggedIn()) navigate('/');
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin }
      });
      if (error) throw error;
      toast.success('Check your email to verify your account!');
      navigate('/login');
      setEmail('');
      setPassword('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSignupLoading(false);
    }
  };

  const handleOAuthSignup = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin }
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4 relative overflow-hidden">
      <Toaster position="top-center" />

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      {/* Back home */}
      <Link
        to="/"
        className="absolute top-5 left-5 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to home
      </Link>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg">CodeShare</span>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8 shadow-2xl shadow-black/40 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-1 text-center">Create an account</h2>
          <p className="text-sm text-gray-500 text-center mb-7">Start coding and collaborating for free</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
              <input
                type="password"
                id="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={signupLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-500/30 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {signupLoading ? <ThreeDots color="#fff" height={18} width={36} /> : 'Create account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs text-gray-600 bg-[#0f0f16]">or continue with</span>
            </div>
          </div>

          <button
            onClick={() => handleOAuthSignup('google')}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] text-sm text-gray-300 hover:text-white font-medium transition-all"
          >
            <FcGoogle className="w-4 h-4" />
            Continue with Google
          </button>

          <p className="text-xs text-gray-600 text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;