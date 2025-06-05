import { FaCode, FaUsers, FaBolt, FaLock } from 'react-icons/fa';

const Features = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white">
              Powerful Features for Modern Developers
            </h2>
            <p className="text-gray-300 text-lg">
              Experience a new way of coding with our comprehensive suite of features designed to enhance your productivity and collaboration.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-pink-500/10 text-pink-500">
                  <FaCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Real-time Collaboration</h3>
                  <p className="text-gray-400">Code together with your team in real-time. See changes instantly and communicate seamlessly.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-orange-500/10 text-orange-500">
                  <FaUsers className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Team Management</h3>
                  <p className="text-gray-400">Invite team members, manage permissions, and organize your projects efficiently.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-purple-500/10 text-purple-500">
                  <FaBolt className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Instant Compilation</h3>
                  <p className="text-gray-400">Run your code instantly and see results in real-time with our powerful compilation engine.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500">
                  <FaLock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Secure & Private</h3>
                  <p className="text-gray-400">Your code is encrypted and secure. Choose what to share and with whom.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <img 
                src="https://code.visualstudio.com/assets/home/swimlane-chat-dark.webp" 
                alt="CodeShare Features Preview" 
                className="w-full h-auto"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg blur-2xl opacity-20"></div>
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg blur-2xl opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
