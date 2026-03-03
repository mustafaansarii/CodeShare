import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Features from '../components/Fetures';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import HowItWorks from '../components/HowItWorks';
import { nanoid } from 'nanoid';
import { Toaster } from 'react-hot-toast';

/* ─── Typewriter hook ─── */
const useTypewriter = (words, speed = 80, pause = 1800) => {
  const [displayed, setDisplayed] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const current = words[wordIdx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplayed(current.slice(0, charIdx + 1));
        if (charIdx + 1 === current.length) setTimeout(() => setDeleting(true), pause);
        else setCharIdx(c => c + 1);
      } else {
        setDisplayed(current.slice(0, charIdx - 1));
        if (charIdx - 1 === 0) { setDeleting(false); setWordIdx(i => (i + 1) % words.length); setCharIdx(0); }
        else setCharIdx(c => c - 1);
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);
  return displayed;
};

/* ─── Stat counter ─── */
const StatCounter = ({ end, suffix = '', label, icon }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = end / 60;
        const t = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(t); }
          else setCount(Math.floor(start));
        }, 16);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return (
    <div ref={ref} className="flex flex-col items-center gap-2 p-5 bg-white/[0.025] border border-white/[0.06] rounded-2xl hover:bg-emerald-500/5 hover:border-emerald-500/15 transition-all duration-300 group">
      <div className="text-emerald-400 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">{count.toLocaleString()}{suffix}</div>
      <div className="text-xs text-gray-500 text-center">{label}</div>
    </div>
  );
};

/* ─── Code line ─── */
const Cl = ({ delay, indent = 0, children }) => (
  <div className="code-line" style={{ animationDelay: `${delay}s`, paddingLeft: `${indent * 1.5}rem` }}>
    {children}
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const typed = useTypewriter(['Python', 'Java', 'JavaScript', 'C++', 'Go', 'Rust']);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setIsLoggedIn(!!user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setIsLoggedIn(!!s?.user));
    return () => subscription?.unsubscribe();
  }, []);

  const handleGetStarted = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/login'); return; }
    const shortId = nanoid(6);
    try {
      const { data, error } = await supabase.from('documents').insert({ id: shortId, content: '', user_id: user.id }).select().single();
      if (error) throw error;
      if (data) navigate(`/editor/${shortId}`);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden md:mt-16">
      <Toaster position="top-center" />
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-12 px-4 overflow-hidden">
        {/* Grid bg */}
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        {/* Orbs */}
        <div className="animate-orb absolute top-0 left-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-emerald-800 rounded-full blur-[120px] opacity-15 pointer-events-none" />
        <div className="animate-orb absolute bottom-10 right-1/4 w-60 h-60 sm:w-80 sm:h-80 bg-blue-900 rounded-full blur-[120px] opacity-12 pointer-events-none" style={{ animationDelay: '-4s' }} />
        <div className="animate-orb absolute top-1/2 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-purple-900 rounded-full blur-[100px] opacity-10 pointer-events-none" style={{ animationDelay: '-8s' }} />

        {/* Two-column (stacks on mobile) */}
        <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ── Left ── */}
          <div className="animate-fade-slide-up flex flex-col gap-5 sm:gap-6 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center justify-center lg:justify-start gap-2 self-center lg:self-start">
              <span className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-xs sm:text-sm text-emerald-300">
                <span className="w-2 h-2 bg-emerald-400 rounded-full pulse-dot flex-shrink-0" />
                Now with real-time collaboration
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] tracking-tight">
              Code, compile &<br />
              <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent">
                collaborate
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
              A professional cloud IDE for{' '}
              <span className="text-emerald-400 font-mono font-semibold">
                {typed}<span className="animate-pulse">|</span>
              </span>
              . Write, run, and share in seconds — no setup needed.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-row gap-2.5 sm:gap-4 items-center justify-center lg:justify-start">
              {isLoggedIn ? (
                <>
                  <button onClick={handleGetStarted} className="group flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-4 py-2.5 sm:px-7 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 whitespace-nowrap">
                    Open New File
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </button>
                  <a href="/files" className="flex items-center justify-center border border-white/15 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-gray-300 hover:text-white px-4 py-2.5 sm:px-7 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 whitespace-nowrap">
                    My Files
                  </a>
                </>
              ) : (
                <>
                  <button onClick={handleGetStarted} className="group flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-4 py-2.5 sm:px-7 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 whitespace-nowrap">
                    Start Coding Free
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </button>
                  <a href="/login" className="flex items-center justify-center border border-white/15 hover:border-white/25 hover:bg-white/5 text-gray-300 hover:text-white px-4 py-2.5 sm:px-7 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 whitespace-nowrap">
                    Sign In
                  </a>
                </>
              )}
            </div>

            {/* Trust line */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Free forever</span>
              <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-700" />
              <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> No credit card</span>
              <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-700" />
              <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Start in seconds</span>
            </div>
          </div>

          {/* ── Right: Code Window ── */}
          <div className="animate-float relative w-full max-w-md mx-auto lg:max-w-none">
            {/* Window */}
            <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0d1117] shadow-2xl shadow-black/60" style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.6), 0 0 80px rgba(16,185,129,0.06)' }}>
              {/* Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#161b22] border-b border-white/[0.06]">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex gap-1 ml-2">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono text-white bg-white/[0.07]">main.py</span>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono text-gray-500">utils.py</span>
                </div>
                <span className="ml-auto flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                  <svg width="8" height="8" fill="currentColor" viewBox="0 0 8 8"><polygon points="1,0 7,4 1,8" /></svg>
                  Run
                </span>
              </div>
              {/* Code body */}
              <div className="flex font-mono text-xs sm:text-sm leading-7 min-h-[200px]">
                <div className="px-3 py-4 text-gray-700 text-[11px] text-right border-r border-white/[0.04] select-none min-w-[2.5rem]">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <div key={n}>{n}</div>)}
                </div>
                <div className="px-4 py-4 flex-1 overflow-x-auto">
                  <Cl delay={0.1}><span className="text-pink-400">def</span> <span className="text-emerald-400">collaborate</span><span className="text-gray-200">(</span><span className="text-amber-300">team</span><span className="text-gray-200">):</span></Cl>
                  <Cl delay={0.2} indent={1}><span className="text-gray-600  italic"># real-time sync ⚡</span></Cl>
                  <Cl delay={0.3} indent={1}><span className="text-pink-400">for</span> <span className="text-amber-300">member</span> <span className="text-pink-400">in</span> <span className="text-amber-300">team</span><span className="text-gray-200">:</span></Cl>
                  <Cl delay={0.4} indent={2}><span className="text-amber-300">member</span><span className="text-gray-200">.</span><span className="text-emerald-400">sync</span><span className="text-gray-200">()</span></Cl>
                  <Cl delay={0.5} indent={2}><span className="text-amber-300">member</span><span className="text-gray-200">.</span><span className="text-emerald-400">notify</span><span className="text-gray-200">(</span><span className="text-green-300">"Update live!"</span><span className="text-gray-200">)</span></Cl>
                  <Cl delay={0.6} indent={1}><span className="text-pink-400">return</span> <span className="text-green-300">"success"</span></Cl>
                  <Cl delay={0.7}> </Cl>
                  <Cl delay={0.8}><span className="text-gray-600">─── Output ──────────────</span></Cl>
                  <Cl delay={0.9}><span className="text-emerald-400">✓</span> <span className="text-lime-300 font-semibold">Update live! × 3 members</span></Cl>
                  <Cl delay={1.0}><span className="text-emerald-400">⏱</span> <span className="text-amber-400">0.002s</span> <span className="text-gray-600">· mem:</span> <span className="text-amber-400">3.1 MB</span></Cl>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="hidden sm:flex absolute -bottom-4 -left-4 items-center gap-2 bg-[#0d1117]/95 border border-emerald-500/20 rounded-xl px-4 py-2.5 shadow-xl backdrop-blur-sm text-sm font-semibold text-white z-10">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full pulse-dot" />
              2 collaborators live
            </div>
            <div className="hidden sm:flex absolute -top-4 -right-4 items-center gap-2 bg-[#0d1117]/95 border border-emerald-500/20 rounded-xl px-4 py-2.5 shadow-xl backdrop-blur-sm text-sm font-semibold text-white z-10">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Instant run
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hidden sm:flex relative z-10 flex-col items-center gap-2 mt-12 text-gray-600 text-[11px]">
          <div className="w-5 h-8 border-2 border-gray-700 rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-gray-600 rounded-full animate-scroll-wheel" />
          </div>
          Scroll to explore
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <div className="border-y border-emerald-500/[0.08] bg-emerald-500/[0.02]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <StatCounter end={10000} suffix="+" label="Developers" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
          <StatCounter end={50000} suffix="+" label="Files Created" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
          <StatCounter end={6} suffix="+" label="Languages" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>} />
          <StatCounter end={99} suffix="%" label="Uptime SLA" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        </div>
      </div>

      <Features />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Home;