const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: 'blue',
    title: 'Instant Code Execution',
    desc: 'Run Python and Java code directly in the browser. See output, execution time, and memory usage in milliseconds — no local setup needed.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: 'purple',
    title: 'Real-time Collaboration',
    desc: 'Share edit access with teammates by email. Changes sync across all open tabs instantly via WebSocket — no refresh needed.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: 'green',
    title: 'Smart File Management',
    desc: 'All your files in one place. Create, rename, and access documents from any device. Files persist securely in the cloud.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
    color: 'orange',
    title: 'One-click Sharing',
    desc: 'Share a unique link to your code with anyone. Viewers can see and run your code without an account.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    color: 'pink',
    title: 'Monaco Editor',
    desc: 'Powered by the same editor as VS Code. Enjoy syntax highlighting, IntelliSense autocomplete, and a familiar coding experience.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    color: 'teal',
    title: 'Access Control',
    desc: 'Full owner control. Grant or revoke edit access per email. Viewers get a read-only experience automatically.',
  },
];

const colorMap = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'group-hover:border-blue-500/40' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'group-hover:border-purple-500/40' },
  green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'group-hover:border-green-500/40' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'group-hover:border-orange-500/40' },
  pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'group-hover:border-pink-500/40' },
  teal: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'group-hover:border-teal-500/40' },
};

const Features = () => (
  <section id="features" className="py-28 bg-[#0a0a0f] relative">
    <div className="absolute inset-0 opacity-[0.025]"
      style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

    <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-20">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-gray-400 mb-6">
          Everything you need
        </div>
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-5">
          Built for developers,<br />
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            loved by teams
          </span>
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Every feature is designed to remove friction from your workflow so you can focus on what matters — writing great code.
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => {
          const c = colorMap[f.color];
          return (
            <div
              key={f.title}
              className={`group relative bg-white/[0.03] border border-white/8 rounded-2xl p-7 hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${c.border}`}
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <div className={`inline-flex p-3 rounded-xl ${c.bg} ${c.text} mb-5`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default Features;
