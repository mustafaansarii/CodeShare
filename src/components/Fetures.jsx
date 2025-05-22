import { FaCode, FaShareAlt, FaLock, FaUsers } from 'react-icons/fa';

const featuresData = [
  {
    icon: FaCode,
    color: 'yellow',
    title: 'Real-time Code Sharing',
    description: 'Collaborate on code in real-time with your team, making teamwork seamless and efficient.'
  },
  {
    icon: FaShareAlt,
    color: 'pink',
    title: 'Easy Snippet Sharing',
    description: 'Share code snippets quickly and easily with a simple link. Perfect for collaboration and learning.'
  },
  {
    icon: FaLock,
    color: 'blue',
    title: 'Private & Secure',
    description: 'Keep your code private and secure with our robust security measures. Control who can access your snippets.'
  },
  {
    icon: FaUsers,
    color: 'green',
    title: 'Team Collaboration',
    description: 'Work together with your team on code projects. Share ideas, review code, and build amazing things.'
  }
];

const Features = () => {
  return (
    <div className="container mx-auto py-20 px-4 max-w-7xl mt-10">
      <h2 className="text-3xl font-semibold text-center mb-8 leading-tight bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent animate-gradient-x">
        Our Key Features
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {featuresData.map((feature, index) => (
          <div
            key={index}
            className="rounded-xl backdrop-blur-lg bg-white/5 border border-white/10 p-6 text-gray-200 shadow-2xl hover:border-white/20 transition-all duration-300"
          >
            <div className={`text-${feature.color}-400 text-3xl mb-4`}>
              <feature.icon />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
