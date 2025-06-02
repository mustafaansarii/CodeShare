import { useState, useEffect } from 'react';
import { FaArrowRight, FaCode, FaBolt, FaTrophy, FaArrowUp, FaClock } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { Toaster } from 'react-hot-toast';
import Footer from '../components/Footer';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Features from '../components/Fetures';
import Testimonials from '../components/Testimonials';
import { nanoid } from 'nanoid';

const StatBox = ({ label, value, icon: Icon, color, subtext }) => (
  <div className="flex-1 min-w-[140px] rounded-lg backdrop-blur-sm bg-white/5 p-5 border border-white/10 hover:border-white/20 transition-all duration-300">
    <p className="text-sm mb-1 text-gray-300">{label}</p>
    <p className="font-bold text-2xl mb-1 text-white">{value}</p>
    <p className={`text-${color}-400 text-xs flex items-center gap-1`}>
      <Icon />{subtext}
    </p>
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeUsers: '1.2K',
    sharedSnippets: '8.7K',
    liveSessions: '412',
    platformActivity: '80%'
  });

  const handleCreateNew = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/login');
      return;
    }

    const shortId = nanoid(6);

    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({ 
          id: shortId,
          content: '',
          user_id: user.id 
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        navigate(`/editor/${shortId}`);
      }
    } catch (error) {
      console.error('Error creating document:', error);
      // Handle error (e.g., show toast notification)
    }
  };

  useEffect(() => {
    const updateStats = () => {
      const randomIncrement = (base, max) => {
        const num = parseInt(base) + Math.floor(Math.random() * max);
        return num > 1000 ? `${(num/1000).toFixed(1)}K` : num.toString();
      };

      setStats({
        activeUsers: randomIncrement(stats.activeUsers, 200),
        sharedSnippets: randomIncrement(stats.sharedSnippets, 500),
        liveSessions: (parseInt(stats.liveSessions) + Math.floor(Math.random() * 50)).toString(),
        platformActivity: `${Math.min(100, Math.floor(Math.random() * 20) + parseInt(stats.platformActivity))}%`
      });
    };

    const interval = setInterval(updateStats, 5 * 60 * 1000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [stats]);

  const handleGetStartedClick = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      navigate('/login');
      return;
    }

    await handleCreateNew();
  };

  return (
    <div className="min-h-screen text-white">
      <Navbar />
      <Toaster position="top-center" reverseOrder={false} />
      <div className="container mx-auto px-4 max-w-7xl mt-10 md:mt-0 py-10 md:py-24">
        <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-24">
          <div className="flex flex-col max-w-xl w-full">
            <h1 className="font-extrabold text-4xl sm:text-5xl md:text-[3.5rem] leading-[1.1] mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-600 bg-clip-text text-transparent">
              Code.<br />
              <span className="bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 bg-clip-text text-transparent">Collaborate.<br />Create Magic.</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-md mb-8">
              SnipShare is where innovation meets collaboration. Experience real-time code sharing, seamless teamwork, and limitless creativity in one powerful platform.
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <button onClick={handleGetStartedClick} className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-md font-semibold flex items-center gap-2 hover:opacity-90 transition-all transform hover:scale-105">
                Get Started <FaArrowRight />
              </button>
              <button className="backdrop-blur-sm bg-white/5 border border-white/10 text-gray-300 px-6 py-3 rounded-md font-medium flex items-center gap-2 hover:bg-white/10 hover:border-white/20 transition-all">
                <FaCode />VsCode Extension <FaBolt className="text-orange-400" />
              </button>
            </div>
          </div>

          <div className="relative max-w-lg w-full">
            <div className="rounded-xl backdrop-blur-lg bg-white/5 border border-white/10 p-8 pt-6 text-gray-200 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-2">
                  {['#ff605c', '#ffbd44', '#00ca56'].map((color, i) => (
                    <span key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <div className="flex-1 text-center text-orange-400 text-sm font-normal select-none">&lt;&gt; SnipShare</div>
                <div className="w-10" />
              </div>
              <h2 className="font-semibold text-lg mb-1 text-white">Platform Overview</h2>
              <p className="text-gray-400 mb-6 text-sm">Real-time Collaboration</p>
              <div className="flex gap-6 mb-6 flex-wrap">
                <StatBox label="Active Users" value={stats.activeUsers} icon={FaArrowUp} color="green" subtext="+32% this month" />
                <StatBox label="Shared Snippets" value={stats.sharedSnippets} icon={FaTrophy} color="orange" subtext="New record!" />
              </div>
              <div className="rounded-lg backdrop-blur-sm bg-white/5 p-4 flex flex-col gap-2 border border-white/10">
                <div className="flex justify-between items-center text-sm mb-1">
                  <div className="flex items-center gap-2 text-orange-400 font-medium">
                    <FaClock />Platform Activity
                  </div>
                  <div className="text-gray-400 font-normal">Peak: 1.5K</div>
                </div>
                <div className="w-full h-3 rounded-full bg-orange-500/20 overflow-hidden">
                  <div className="h-3 rounded-full bg-gradient-to-r from-orange-400 to-pink-500" style={{ width: stats.platformActivity }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400 font-normal">
                  <span>{stats.activeUsers} active now</span>
                  <span>{stats.platformActivity} capacity</span>
                </div>
              </div>
            </div>
            <div className="absolute top-2 right-4 backdrop-blur-lg bg-white/5 rounded-lg p-4 w-32 text-center text-gray-200 border border-white/10">
              <p className="mb-1">Live Sessions</p>
              <p className="font-semibold text-orange-400 text-lg">{stats.liveSessions} <span className="text-gray-200">active</span></p>
              <div className="h-1 w-16 bg-orange-400 rounded mt-1 mx-auto" />
            </div>
          </div>
        </div>
      </div>
      <Features />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Home;
