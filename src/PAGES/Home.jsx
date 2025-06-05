import { useState, useEffect } from 'react';
import { FaArrowRight, FaCode, FaBolt } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { Toaster } from 'react-hot-toast';
import Footer from '../components/Footer';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Features from '../components/Fetures';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import { nanoid } from 'nanoid';

const Home = () => {
  const navigate = useNavigate();

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
    }
  };

  const handleGetStartedClick = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      navigate('/login');
      return;
    }

    await handleCreateNew();
  };

  return (
    <div className="min-h-screen text-white bg-gradient-to-b from-black to-gray-900">
      <Navbar />
      <Toaster position="top-center" reverseOrder={false} />
      <section className="py-10 md:py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 md:space-y-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
                Code.<br />
                <div className="flex flex-col">
                  <span className="text-white">Collaborate.</span>
                  <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">Create Magic.</span>
                </div>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed">
                Experience the future of coding with CodeShare - where <span className="font-bold underline decoration-pink-500">writing</span>, <span className="font-bold underline decoration-orange-500">compiling</span>, and <span className="font-bold underline decoration-yellow-500">sharing</span> code becomes seamless. Our platform combines <span className="font-bold underline decoration-purple-500">intelligent saving</span>, <span className="font-bold underline decoration-blue-500">fast compilation</span>, and <span className="font-bold underline decoration-green-500">real-time collaboration</span>. Whether solo or team-based, CodeShare lets you <span className="font-bold underline decoration-indigo-500">version control</span>, <span className="font-bold underline decoration-red-500">debug</span>, and <span className="font-bold underline decoration-teal-500">deploy</span> with confidence - all in one powerful platform.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={handleGetStartedClick} className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:opacity-90 transition-all transform hover:scale-105 shadow-md">
                  Get Started <FaArrowRight />
                </button>
                <button className="backdrop-blur-sm bg-white/5 border border-white/10 text-gray-300 px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:bg-white/10 hover:border-white/20 transition-all">
                  <FaCode />VsCode Extension <FaBolt className="text-orange-400" />
                </button>
              </div>
            </div>

            <div className="relative w-full max-w-2xl mx-auto lg:mx-0">
              <div className="rounded-xl overflow-hidden shadow-2xl transform transition-transform duration-300 hover:scale-[1.02]">
                <img 
                  src="https://code.visualstudio.com/assets/home/swimlane-nes-dark.webp" 
                  alt="VS Code Interface" 
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg blur-2xl opacity-20"></div>
              <div className="absolute -top-6 -right-6 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg blur-2xl opacity-20"></div>
            </div>
          </div>
        </div>
      </section>
      <Features />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Home;