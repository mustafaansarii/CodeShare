import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Features from '../components/Fetures';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import { nanoid } from 'nanoid';
import { Toaster } from 'react-hot-toast';

/* ─── Animated typing cursor ─── */
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
        if (charIdx + 1 === current.length) {
          setTimeout(() => setDeleting(true), pause);
        } else {
          setCharIdx(c => c + 1);
        }
      } else {
        setDisplayed(current.slice(0, charIdx - 1));
        if (charIdx - 1 === 0) {
          setDeleting(false);
          setWordIdx(i => (i + 1) % words.length);
          setCharIdx(0);
        } else {
          setCharIdx(c => c - 1);
        }
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return displayed;
};

/* ─── Animated stat counter ─── */
const StatCounter = ({ end, suffix = '', label }) => {
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
    <div ref={ref} className="text-center">
      <div className="text-4xl font-bold text-white">{count.toLocaleString()}{suffix}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const typed = useTypewriter(['Python', 'Java', 'JavaScript', 'C++', 'Go']);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setIsLoggedIn(!!user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => subscription?.unsubscribe();
  }, []);

  const handleGetStarted = async () => {
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

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <Toaster position="top-center" />
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative min-h-[100vh] flex items-center">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-600 rounded-full blur-[140px] opacity-8 pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-emerald-800 rounded-full blur-[120px] opacity-8 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-emerald-500/8 border border-emerald-500/15 rounded-full px-4 py-1.5 text-sm text-emerald-300">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Now with real-time collaboration
            </div>
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight">
              Code, compile &<br />
              <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent">
                collaborate
              </span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed max-w-xl">
              A professional cloud code editor for <span className="text-emerald-400 font-semibold">{typed}<span className="animate-pulse">|</span></span>.
              Write, run, and share code instantly — no setup required.
            </p>
            <div className="flex flex-wrap gap-4">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={handleGetStarted}
                    className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-7 py-3.5 rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                  >
                    Open New File
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                  <a
                    href="/files"
                    className="flex items-center gap-2 border border-emerald-500/20 hover:border-emerald-400/40 hover:bg-emerald-500/5 text-gray-300 hover:text-white px-7 py-3.5 rounded-lg font-medium transition-all duration-200"
                  >
                    My Files
                  </a>
                </>
              ) : (
                <>
                  <button
                    onClick={handleGetStarted}
                    className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-7 py-3.5 rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                  >
                    Start Coding Free
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                  <a
                    href="/login"
                    className="flex items-center gap-2 border border-emerald-500/20 hover:border-emerald-400/40 hover:bg-emerald-500/5 text-gray-300 hover:text-white px-7 py-3.5 rounded-lg font-medium transition-all duration-200"
                  >
                    Sign In
                  </a>
                </>
              )}
            </div>
            {/* Trust line */}
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No credit card · Free forever plan · Start in seconds
            </p>
          </div>

          {/* Right – code window mockup */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden border border-white/8 shadow-2xl shadow-black/60">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                <span className="mx-auto text-xs text-gray-500 font-mono">main.py — CodeShare</span>
              </div>
              {/* Code body */}
              <div className="p-6 font-mono text-sm leading-7">
                <div><span className="text-purple-400">def</span> <span className="text-emerald-400">collaborate</span><span className="text-white">(</span><span className="text-orange-300">team</span><span className="text-white">):</span></div>
                <div className="ml-8"><span className="text-emerald-600"># real-time sync across all users</span></div>
                <div className="ml-8"><span className="text-purple-400">for</span> <span className="text-orange-300">member</span> <span className="text-purple-400">in</span> <span className="text-orange-300">team</span><span className="text-white">:</span></div>
                <div className="ml-16"><span className="text-orange-300">member</span><span className="text-white">.</span><span className="text-emerald-400">sync</span><span className="text-white">()</span></div>
                <div className="ml-16"><span className="text-orange-300">member</span><span className="text-white">.</span><span className="text-emerald-400">notify</span><span className="text-white">(</span><span className="text-green-300">"Update live!"</span><span className="text-white">)</span></div>
                <div className="ml-8"><span className="text-purple-400">return</span> <span className="text-green-300">"success"</span></div>
                <div className="mt-3 text-gray-700">─────────────────────────</div>
                <div className="mt-1"><span className="text-gray-500">Output: </span><span className="text-emerald-400">Update live! ×3 members</span></div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-500">Time: </span>
                  <span className="text-yellow-400">0.002s</span>
                  <span className="ml-4 text-gray-500">Memory: </span>
                  <span className="text-yellow-400">3.1 MB</span>
                </div>
              </div>
            </div>
            {/* Floating badges */}
            <div className="absolute -bottom-4 -left-4 bg-[#0d1a0f] border border-emerald-500/20 rounded-xl px-4 py-2.5 shadow-xl flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-white">2 collaborators live</span>
            </div>
            <div className="absolute -top-4 -right-4 bg-[#0d1a0f] border border-emerald-500/20 rounded-xl px-4 py-2.5 shadow-xl flex items-center gap-2.5">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-medium text-white">Instant run</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <div className="border-y border-emerald-500/10 bg-emerald-500/[0.02]">
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCounter end={10000} suffix="+" label="Developers" />
          <StatCounter end={50000} suffix="+" label="Files Created" />
          <StatCounter end={6} suffix=" langs" label="Python, Java, C, C++, JavaScript, and more" />
          <StatCounter end={99} suffix="%" label="Uptime" />
        </div>
      </div>

      <Features />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Home;