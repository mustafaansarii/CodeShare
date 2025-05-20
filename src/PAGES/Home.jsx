import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { isUserLoggedIn } from '../utils/auth';
import { Toaster } from 'react-hot-toast';
import Editor from "@monaco-editor/react";
import Footer from '../components/Footer';
import { supabase } from '../supabaseClient';
import { FaArrowRight } from 'react-icons/fa';
import Features from '../components/Fetures';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
const Home = () => {
  const navigate = useNavigate();
  const isLoggedIn = isUserLoggedIn();
  const codeExample = ` // Quick Sort Algorithm in JavaScript
function quickSort(arr) {
  if (arr.length <= 1) {
    return arr;
  }

  const pivot = arr[Math.floor(arr.length / 2)];
  const left = [];
  const middle = [];
  const right = [];

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else if (arr[i] > pivot) {
      right.push(arr[i]);
    } else {
      middle.push(arr[i]);
    }
  }

  return quickSort(left).concat(middle, quickSort(right));
}

const unsortedArray = [3, 6, 8, 10, 1, 2, 1];
const sortedArray = quickSort(unsortedArray);
console.log(sortedArray); // Output: [1, 1, 2, 3, 6, 8, 10]
`;

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

  return (
    <div className="min-h-screen text-white">
      <Navbar />
      <Toaster position="top-center" reverseOrder={false} />
      <div className="container mx-auto px-4 max-w-7xl mt-10 md:mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-7xl lg:max-w-[1200px] mx-auto">
          {/* Left Section - Heading and Description */}
          <div className="space-y-10 px-4 animate-fade-in-up">
            <h1 className="text-4xl md:text-7xl font-bold leading-tight bg-gradient-to-r from-yellow-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient-x">
              Code. Collaborate. <br className="hidden md:block" />
              <span className="text-yellow-300">Create Magic.</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-lg leading-relaxed font-light">
              SnipShare is where innovation meets collaboration. Experience real-time code sharing, 
              seamless teamwork, and limitless creativity in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
              <button 
                onClick={() => isLoggedIn ? handleCreateNew() : navigate('/login')}
                className="relative flex items-center gap-2 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl group border border-white w-full sm:w-auto"
                title="Create New Document"
              >
                <div className="absolute inset-0 border-2 border-white rounded-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2 text-white">
                  <span className="text-sm font-semibold tracking-wide">Get Started <FaArrowRight className="inline-block ml-1" /></span>
                </div>
              </button>
            </div>
          </div>

          {/* Right Section - Code Editor */}
          <div className="hidden md:block relative rounded-xl overflow-hidden shadow-2xl border border-gray-700 w-full md:w-10/12 mx-auto mt-15">
            <div className="absolute inset-x-0 top-0 bg-gray-8 00 py-2 px-4 flex items-center">
              <div className="flex space-x-2">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full"></div>
                <div className="w-2 h-2 md:w-3 md:h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-xs md:text-sm text-gray-400 ml-2 md:ml-4">example.js</div>
            </div>
            <Editor
              height="550px"
              width="100%"
              defaultLanguage="javascript"
              value={codeExample}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                automaticLayout: true,
                renderLineHighlight: 'all',
                contextmenu: false,
                fontSize: 13,
                padding: { top: 0 },
                scrollbar: {
                  vertical: 'auto',
                  horizontal: 'auto'
                },
                glyphMargin: false,
                folding: false,
                renderWhitespace: 'none',
                guides: {
                  indentation: false
                },
                overviewRulerLanes: 0
              }}
              className="h-[550px]"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gray-800 py-2 px-4 text-xs md:text-sm text-gray-400">
              <span className="text-green-400">●</span> Connected
            </div>
          </div>
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
