const testimonials = [
  {
    name: 'Priya Sharma',
    title: 'Senior Engineer',
    company: 'Infosys',
    avatar: 'PS',
    gradient: 'from-blue-500 to-purple-600',
    stars: 5,
    quote: 'CodeShare made it effortless to share code snippets during interviews and pair sessions. The real-time sync is incredibly smooth.',
  },
  {
    name: 'Alex Chen',
    title: 'Full Stack Developer',
    company: 'Startup Labs',
    avatar: 'AC',
    gradient: 'from-pink-500 to-orange-500',
    stars: 5,
    quote: 'I replaced our old pastebin setup entirely. The Monaco editor, instant run, and link sharing — everything just works perfectly.',
  },
  {
    name: 'Rahul Mehta',
    title: 'CS Student',
    company: 'IIT Bombay',
    avatar: 'RM',
    gradient: 'from-teal-500 to-green-500',
    stars: 5,
    quote: 'We use this for competitive programming practice with friends. The live collaboration feature is a game-changer for group study.',
  },
];

const Testimonials = () => (
  <section className="py-20 sm:py-28 bg-[#0a0a0f] relative overflow-hidden">
    <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-900/10 rounded-full blur-[100px] pointer-events-none" />

    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-12 sm:mb-16">
        <span className="inline-flex bg-white/[0.04] border border-white/10 rounded-full px-4 py-1.5 text-xs text-gray-400 mb-5">
          Loved by developers
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
          What our users say
        </h2>
        <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto">
          Join thousands of developers who've made CodeShare their go-to coding tool.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="group flex flex-col gap-4 bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.04] hover:-translate-y-1 hover:border-white/10 hover:shadow-xl transition-all duration-300"
          >
            {/* Stars */}
            <div className="flex gap-1">
              {[...Array(t.stars)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            {/* Quote */}
            <p className="text-sm text-gray-300 leading-relaxed flex-1">"{t.quote}"</p>

            {/* Author */}
            <div className="flex items-center gap-3 relative">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                {t.avatar}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{t.name}</div>
                <div className="text-xs text-gray-500">{t.title} · <span className="text-gray-400">{t.company}</span></div>
              </div>
              <svg className="w-6 h-6 text-indigo-500/20 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
