import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { isUserLoggedIn } from '../utils/auth';
import { FaUserCircle, FaPlus, FaFileAlt, FaSignOutAlt, FaCode } from 'react-icons/fa';
import { FiLogIn, FiUserPlus } from 'react-icons/fi';

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(isUserLoggedIn());
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = isUserLoggedIn();
      setIsLoggedIn(loggedIn);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        checkAuth();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleCreateNew = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data } = await supabase
      .from('documents')
      .insert([{ 
        content: '',
        user_id: user?.id 
      }])
      .select()
      .single();
    
    if (data) {
      navigate(`/editor/${data.id}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sb-krgblphvrhpvmneqipqe-auth-token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  return (
    <nav className="w-full backdrop-blur-sm bg-white/5 border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-600 bg-clip-text text-transparent hover:opacity-90 transition-opacity">
          <FaCode className="w-6 h-6" />
          <span>SnipShare</span>
        </a>
        
        <div className="flex items-center gap-4">
          {isLoggedIn ? <button 
              onClick={handleCreateNew}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-4 py-2 rounded-lg transition-all hover:opacity-90 transform hover:scale-105 shadow-md"
              title="Create New Document"
            >
              <FaPlus className="w-4 h-4" />
              <span className="hidden md:inline text-sm font-medium">New Document</span>
            </button> : null}
          
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleProfileDropdown}
                className="text-gray-300 hover:text-pink-500 transition-colors focus:outline-none hover:bg-white/5 p-2 rounded-full"
                title="Profile"
              >
                <FaUserCircle className="w-6 h-6" />
              </button>
              
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 backdrop-blur-lg bg-white/5 rounded-lg shadow-xl z-10 border border-white/10 overflow-hidden">
                  <div className="py-1">
                    <a 
                      href="/files" 
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/10 w-full transition-colors"
                    >
                      <FaFileAlt className="w-4 h-4 text-pink-500" />
                      Your Files
                    </a>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/10 w-full transition-colors"
                    >
                      <FaSignOutAlt className="w-4 h-4 text-red-400" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <a 
                href="/login" 
                className="flex items-center gap-2 backdrop-blur-sm bg-white/5 border border-white/10 text-gray-300 px-4 py-2 rounded-lg transition-all hover:bg-white/10 hover:border-white/20 transform hover:scale-105"
                title="Login"
              >
                <FiLogIn className="w-4 h-4" />
                <span className="hidden md:inline text-sm font-medium">Login</span>
              </a>
              <a 
                href="/signup" 
                className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-4 py-2 rounded-lg transition-all hover:opacity-90 transform hover:scale-105 shadow-md"
                title="Signup"
              >
                <FiUserPlus className="w-4 h-4" />
                <span className="hidden md:inline text-sm font-medium">Signup</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;