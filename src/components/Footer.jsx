
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const Footer = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setIsLoggedIn(!!user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => subscription?.unsubscribe();
  }, []);

  return (
    <footer className="bg-[#0c0c14]">
      {/* ── CTA band — logged-out only ── */}
      {!isLoggedIn && (
        <div className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Ready to start coding?</h3>
              <p className="text-gray-400 text-sm">Free forever. No setup. No credit card required.</p>
            </div>
            <a
              href="/signup"
              className="flex-shrink-0 group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 hover:-translate-y-0.5"
            >
              Get started free
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      )}

      {/* ── Main footer body ── */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="relative w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30 flex-shrink-0">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/20 to-transparent" />
                <span className="relative z-10 text-white font-black text-base leading-none">C</span>
              </div>
              <span className="text-white font-bold text-[15px]">CodeShare</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              A professional cloud code editor. Write, compile, and collaborate in real time — no setup required.
            </p>
            <a
              href="mailto:codeshare.solution@gmail.com"
              className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors border border-white/8 hover:border-white/15 rounded-lg px-3 py-2"
            >
              <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              codeshare.solution@gmail.com
            </a>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-5">Product</h4>
            <ul className="space-y-3">
              {[
                { label: 'Features', href: '/#features' },
                { label: 'FAQ', href: '/#faq' },
                { label: 'My Files', href: '/files' },
              ].map(l => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-gray-500 hover:text-gray-200 transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-5">Account</h4>
            <ul className="space-y-3">
              {isLoggedIn ? (
                <>
                  <li><a href="/files" className="text-sm text-gray-500 hover:text-gray-200 transition-colors">My Files</a></li>
                  <li><a href="/login" className="text-sm text-gray-500 hover:text-gray-200 transition-colors">Sign out</a></li>
                </>
              ) : (
                <>
                  <li><a href="/login" className="text-sm text-gray-500 hover:text-gray-200 transition-colors">Sign in</a></li>
                  <li><a href="/signup" className="text-sm text-gray-500 hover:text-gray-200 transition-colors">Create account</a></li>
                </>
              )}
            </ul>
          </div>

          {/* Collaborate column */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-5">Collaborate</h4>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Have ideas or want to contribute to improving CodeShare? Reach out — we'd love to work together.
            </p>
            <a
              href="mailto:codeshare.solution@gmail.com"
              className="group inline-flex items-center gap-2 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 hover:text-purple-200 px-4 py-2.5 rounded-xl text-xs font-medium transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send a message
              <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} CodeShare. All rights reserved.
          </p>
          <p className="text-gray-700 text-xs">
            Built with ❤️ for developers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

