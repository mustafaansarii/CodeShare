import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const Footer = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setIsLoggedIn(!!user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setIsLoggedIn(!!session?.user));
    return () => subscription?.unsubscribe();
  }, []);

  return (
    <footer className="bg-[#080810]">

      {/* ── CTA band (logged-out only) ── */}
      {!isLoggedIn && (
        <div className="border-t border-white/[0.05] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(16,185,129,0.07)_0%,transparent_60%)]" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-8">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                🚀 Free forever
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">Ready to start coding?</h3>
              <p className="text-gray-400 text-sm">Join thousands of developers. No setup. No credit card required.</p>
            </div>
            <div className="flex flex-col items-stretch sm:items-end gap-3 w-full sm:w-auto">
              <a
                href="/signup"
                className="group flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-7 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-emerald-600/30 hover:-translate-y-0.5 whitespace-nowrap"
              >
                Get started free
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </a>
              <a href="/login" className="text-center text-xs text-gray-600 hover:text-gray-400 transition-colors">Already have an account? Sign in →</a>
            </div>
          </div>
        </div>
      )}

      {/* ── Main footer ── */}
      <div className="border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-white shadow-lg shadow-emerald-600/30">C</div>
              <span className="text-white font-bold text-base">CodeShare</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-4 max-w-[18rem]">
              A professional cloud code editor. Write, compile, and collaborate in real time — no setup required.
            </p>
            <a href="mailto:codeshare.solution@gmail.com" className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors border border-white/[0.07] hover:border-white/15 rounded-lg px-3 py-2">
              <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              codeshare.solution@gmail.com
            </a>
            {/* Language badges */}
            <div className="flex flex-wrap gap-1.5 mt-4">
              {['Python', 'Java', 'C++', 'JS', 'Go'].map(l => (
                <span key={l} className="text-[10px] font-mono font-bold text-gray-600 border border-white/[0.06] rounded px-1.5 py-0.5">{l}</span>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Product</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Features', href: '/#features' },
                { label: 'How it Works', href: '/#howitworks' },
                { label: 'FAQ', href: '/#faq' },
                { label: 'My Files', href: '/files' },
              ].map(l => (
                <li key={l.label}><a href={l.href} className="text-sm text-gray-500 hover:text-gray-200 transition-colors">{l.label}</a></li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Account</h4>
            <ul className="space-y-2.5">
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

          {/* Contact */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Collaborate</h4>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">Have ideas or want to contribute? Reach out — we'd love to work together.</p>
            <a
              href="mailto:codeshare.solution@gmail.com"
              className="group inline-flex items-center gap-2 bg-purple-600/10 hover:bg-purple-600/18 border border-purple-500/20 hover:border-purple-500/35 text-purple-300 hover:text-purple-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Send a message
              <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </a>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="text-xs text-gray-700">© {new Date().getFullYear()} CodeShare. All rights reserved.</p>
          <p className="text-xs text-gray-700">Built with ❤️ for developers</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
