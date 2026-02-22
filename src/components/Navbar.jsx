import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { isUserLoggedIn } from '../utils/auth';
import { nanoid } from 'nanoid';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(isUserLoggedIn());
  const [userEmail, setUserEmail] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobile, setShowMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [banner, setBanner] = useState(true);
  const dropdownRef = useRef(null);

  /* ─── Auth state ─── */
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email || '');
    };
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsLoggedIn(event === 'SIGNED_IN');
      setUserEmail(session?.user?.email || '');
    });
    return () => subscription?.unsubscribe();
  }, []);

  /* ─── Scroll detection ─── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ─── Close dropdown on outside click ─── */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ─── Close mobile menu on route change ─── */
  useEffect(() => { setShowMobile(false); }, [location]);

  /* ─── Actions ─── */
  const handleCreateNew = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/login'); return; }
    const shortId = nanoid(6);
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({ id: shortId, content: '', user_id: user.id })
        .select().single();
      if (error) throw error;
      if (data) navigate(`/editor/${shortId}`);
    } catch (e) { console.error(e); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('sb-krgblphvrhpvmneqipqe-auth-token');
    setIsLoggedIn(false);
    setUserEmail('');
    navigate('/login');
  };

  const avatarLetter = userEmail ? userEmail[0].toUpperCase() : 'U';
  const navLinks = isLoggedIn
    ? [{ label: 'Features', href: '/#features' }, { label: 'My Files', href: '/files' }, { label: 'FAQ', href: '/#faq' }]
    : [{ label: 'Features', href: '/#features' }, { label: 'FAQ', href: '/#faq' }];

  /* Smooth-scroll for /#hash links when already on / */
  const handleNavClick = (e, href) => {
    if (href.startsWith('/#') && location.pathname === '/') {
      e.preventDefault();
      const id = href.slice(2);
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setShowMobile(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
      {/* ── Announcement banner ── */}
      {banner && (
        <div className="relative bg-gradient-to-r from-blue-600/90 to-indigo-600/90 backdrop-blur-sm text-white text-xs py-2 px-4 text-center">
          <span className="font-medium">🚀 Real-time collaboration is live!</span>
          <span className="ml-2 text-blue-100">Share edit access with teammates by email →</span>
          <a href="/signup" className="ml-3 underline underline-offset-2 font-semibold hover:text-white/80 transition-colors">Try free</a>
          <button
            onClick={() => setBanner(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Main nav bar ── */}
      <nav className={`transition-all duration-300 ${scrolled
        ? 'bg-[#0a0a0f]/95 backdrop-blur-xl shadow-2xl shadow-black/30'
        : 'bg-[#0a0a0f]/60 backdrop-blur-md'
        } border-b border-white/[0.06]`}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[54px] flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="relative w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/40 group-hover:shadow-blue-500/60 transition-shadow">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/20 to-transparent" />
              <span className="relative z-10 text-white font-black text-base leading-none">C</span>
            </div>
            <span className="text-white font-bold text-[15px] tracking-tight group-hover:text-blue-300 transition-colors">
              CodeShare
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 ${isActive
                    ? 'text-white bg-white/8'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full" />
                  )}
                </a>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2.5">
            {isLoggedIn ? (
              <>
                {/* New File button */}
                <button
                  onClick={handleCreateNew}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white pl-3 pr-4 py-1.5 rounded-lg transition-all shadow-md shadow-blue-600/30 hover:shadow-blue-500/40 hover:-translate-y-px"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  New File
                </button>

                {/* Avatar + dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(o => !o)}
                    className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group"
                    aria-label="User menu"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md flex-shrink-0">
                      {avatarLetter}
                    </div>
                    <svg
                      className={`w-3.5 h-3.5 text-gray-500 group-hover:text-gray-300 transition-all ${showDropdown ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-[#12121c] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-white/8">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm text-white font-medium truncate mt-0.5">{userEmail}</p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={handleCreateNew}
                          className="flex sm:hidden w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          New File
                        </button>
                        <a
                          href="/files"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                          </svg>
                          Your Files
                        </a>
                      </div>

                      <div className="border-t border-white/8 py-1">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="text-sm text-gray-400 hover:text-white px-4 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all font-medium"
                >
                  Sign in
                </a>
                <a
                  href="/signup"
                  className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg font-semibold transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 hover:-translate-y-px"
                >
                  Get started
                </a>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setShowMobile(o => !o)}
              aria-label="Toggle menu"
            >
              {showMobile ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {showMobile && (
          <div className="md:hidden border-t border-white/8 bg-[#0a0a0f]/98 px-5 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            {!isLoggedIn && (
              <div className="pt-3 border-t border-white/8 flex flex-col gap-2">
                <a href="/login" className="w-full text-center py-2.5 text-sm font-medium text-gray-300 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                  Sign in
                </a>
                <a href="/signup" className="w-full text-center py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-md shadow-blue-600/30">
                  Get started free
                </a>
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;