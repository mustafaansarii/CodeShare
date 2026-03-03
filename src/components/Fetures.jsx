const features = [
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    tag: { label: 'Core', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    title: 'Instant Code Execution',
    desc: 'Run Python and Java directly in the browser. See output, execution time, and memory usage in milliseconds.',
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    tag: { label: 'Live', cls: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    title: 'Real-time Collaboration',
    desc: 'Share edit access with teammates by email. Changes sync instantly via WebSocket — no refresh needed.',
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    color: 'text-green-400 bg-green-500/10 border-green-500/20',
    tag: { label: 'Cloud', cls: 'text-green-400 bg-green-500/10 border-green-500/20' },
    title: 'Smart File Management',
    desc: 'All your files in one place. Create, rename, and access documents from any device. Persisted securely.',
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>,
    color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    tag: { label: 'Share', cls: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    title: 'One-click Sharing',
    desc: 'Share a unique link with anyone. Viewers can read and run your code without an account.',
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
    color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    tag: { label: 'Editor', cls: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
    title: 'Monaco Editor',
    desc: 'Powered by the same engine as VS Code — syntax highlighting, IntelliSense, and a familiar experience.',
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    tag: { label: 'Security', cls: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
    title: 'Granular Access Control',
    desc: 'Full owner control. Grant or revoke edit access per email. Viewers get read-only automatically.',
  },
];

const Features = () => (
  <section id="features" className="py-20 sm:py-28 bg-[#0a0a0f] relative overflow-hidden">
    <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.05)_0%,transparent_70%)]" />

    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-12 sm:mb-16">
        <span className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-4 py-1.5 text-xs text-gray-400 mb-5">
          Everything you need
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
          Built for developers,<br />
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">loved by teams</span>
        </h2>
        <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Every feature removes friction from your workflow so you can focus on what matters — writing great code.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="group relative bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.045] hover:-translate-y-1 hover:border-white/10 transition-all duration-300 overflow-hidden"
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 bg-[radial-gradient(ellipse_at_30%_30%,rgba(139,92,246,0.07)_0%,transparent_60%)] pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`inline-flex p-2.5 rounded-xl border ${f.color}`}>{f.icon}</div>
                <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-full border ${f.tag.cls}`}>{f.tag.label}</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2 tracking-tight">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
