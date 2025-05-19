import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { isUserLoggedIn } from '../utils/auth';
import { FaUserCircle, FaPlus, FaFileAlt, FaSignOutAlt } from 'react-icons/fa';
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
    <nav className="w-full border-b border-gray-700 shadow-lg">
      <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="text-white text-xl font-bold hover:text-blue-400 transition-colors flex items-center gap-2">
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">SnipLink</span>
        </a>
        
        <div className="flex items-center gap-4">
          {isLoggedIn ? <button 
              onClick={handleCreateNew}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-all hover:scale-105 shadow-md"
              title="Create New Document"
            >
              <FaPlus className="w-4 h-4" />
              <span className="hidden md:inline text-sm font-medium">New Document</span>
            </button> : null}
          
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleProfileDropdown}
                className="text-gray-300 hover:text-blue-400 transition-colors focus:outline-none hover:bg-gray-700 p-2 rounded-full"
                title="Profile"
              >
                <FaUserCircle className="w-6 h-6" />
              </button>
              
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl z-10 border border-gray-700 overflow-hidden">
                  <div className="py-1">
                    <a 
                      href="/files" 
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-700 w-full transition-colors"
                    >
                      <FaFileAlt className="w-4 h-4 text-blue-400" />
                      Your Files
                    </a>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-700 w-full transition-colors"
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
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-1.5 rounded-lg transition-all hover:scale-105 shadow-md"
                title="Login"
              >
                <FiLogIn className="w-4 h-4" />
                <span className="hidden md:inline text-sm font-medium">Login</span>
              </a>
              <a 
                href="/signup" 
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-1.5 rounded-lg transition-all hover:scale-105 shadow-md"
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