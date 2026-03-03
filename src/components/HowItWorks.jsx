const steps = [
    {
        num: '01',
        title: 'Create a file',
        desc: 'Sign up for free and open a new file in seconds. No IDE to install.',
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" /></svg>,
        accent: 'text-emerald-400',
        iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    },
    {
        num: '02',
        title: 'Write & run code',
        desc: 'Use the Monaco editor to write code. Hit Run and see output in milliseconds.',
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
        accent: 'text-blue-400',
        iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    },
    {
        num: '03',
        title: 'Share instantly',
        desc: 'Copy the link and share with anyone. They join in real time, no friction.',
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>,
        accent: 'text-purple-400',
        iconBg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    },
    {
        num: '04',
        title: 'Collaborate live',
        desc: 'Grant edit access per email. All changes sync via WebSocket instantly.',
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
        accent: 'text-orange-400',
        iconBg: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    },
];

const HowItWorks = () => (
    <section id="howitworks" className="py-20 sm:py-28 bg-[#0c0c14]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12 sm:mb-16">
                <span className="inline-flex bg-white/[0.04] border border-white/10 rounded-full px-4 py-1.5 text-xs text-gray-400 mb-5">
                    How it works
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
                    From idea to running code<br />
                    <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">in four steps</span>
                </h2>
                <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto">
                    The fastest path from thought to working, shareable code.
                </p>
            </div>

            {/* Steps grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {steps.map((step, i) => (
                    <div key={i} className="group relative bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6 text-center hover:bg-white/[0.04] hover:-translate-y-1 transition-all duration-300">
                        {/* Connector arrow (desktop only) */}
                        {i < steps.length - 1 && (
                            <div className={`hidden lg:block absolute top-10 -right-2.5 z-10 ${step.accent}`}>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                            </div>
                        )}
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border ${step.iconBg} mx-auto mb-4`}>
                            {step.icon}
                        </div>
                        <div className={`text-xs font-black tracking-widest mb-2 ${step.accent}`}>{step.num}</div>
                        <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default HowItWorks;
