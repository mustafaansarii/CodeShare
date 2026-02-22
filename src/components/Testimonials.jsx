const testimonials = [
  {
    name: 'Priya Sharma',
    title: 'Senior Engineer',
    company: 'Infosys',
    avatar: 'PS',
    color: 'from-blue-500 to-purple-500',
    quote: 'CodeShare made it effortless to share code snippets during interviews and pair sessions. The real-time sync is incredibly smooth.',
  },
  {
    name: 'Alex Chen',
    title: 'Full Stack Developer',
    company: 'Startup Labs',
    avatar: 'AC',
    color: 'from-pink-500 to-orange-500',
    quote: 'I replaced our old pastebin setup entirely. The Monaco editor, instant run, and link sharing — everything just works perfectly.',
  },
  {
    name: 'Rahul Mehta',
    title: 'CS Student',
    company: 'IIT Bombay',
    avatar: 'RM',
    color: 'from-teal-500 to-green-500',
    quote: 'We use this for competitive programming practice with friends. The live collaboration feature is a game-changer for group study.',
  },
];

const Testimonials = () => (
  <section className="py-28 bg-[#0c0c14]">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-gray-400 mb-6">
          Loved by developers
        </div>
        <h2 className="text-4xl lg:text-5xl font-bold text-white">
          What our users say
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="bg-white/[0.03] border border-white/8 rounded-2xl p-7 hover:bg-white/[0.05] hover:-translate-y-1 transition-all duration-300"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            {/* Quote */}
            <svg className="w-8 h-8 text-blue-500/40 mb-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">"{t.quote}"</p>

            {/* Author */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                {t.avatar}
              </div>
              <div>
                <div className="text-white text-sm font-semibold">{t.name}</div>
                <div className="text-gray-500 text-xs">{t.title} · {t.company}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
