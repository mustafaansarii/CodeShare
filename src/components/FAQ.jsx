import { useState } from 'react';

const faqs = [
  {
    category: 'Getting Started',
    color: 'text-emerald-400',
    items: [
      { q: 'Is CodeShare free to use?', a: 'Yes — 100% free. Sign up with your email and start creating files immediately. No credit card, no limits on file count.' },
      { q: 'Do I need to install anything?', a: 'Nothing. CodeShare runs entirely in your browser, powered by the Monaco Editor (same engine as VS Code). Just sign up and start coding.' },
      { q: 'Which programming languages are supported?', a: 'Python and Java have full live execution. The editor also provides syntax highlighting for JavaScript, C++, Go, and more.' },
    ],
  },
  {
    category: 'Collaboration',
    color: 'text-purple-400',
    items: [
      { q: 'How does real-time collaboration work?', a: 'Any user with edit access can open the same link and type simultaneously. Changes sync across all tabs via WebSocket (Supabase Realtime) — no refresh needed.' },
      { q: 'How do I give someone edit access?', a: "Open the document, click Share in the top-right, and enter the person's email. They can edit via the same link. You can revoke access anytime." },
      { q: 'Can someone view my code without an account?', a: 'Yes. Anyone with the link can view and run code without signing in. Edit access requires a CodeShare account and an explicit invite.' },
    ],
  },
  {
    category: 'Editor & Execution',
    color: 'text-blue-400',
    items: [
      { q: 'How do I run code and pass input?', a: 'Select your language from the toolbar, write code in the editor, type stdin input in the Input panel, and click Run. Output appears immediately.' },
      { q: 'Are my files saved automatically?', a: "Yes. Every keystroke auto-saves to the cloud. You never need Ctrl+S — close the tab and your code will be exactly where you left it." },
    ],
  },
  {
    category: 'Privacy & Security',
    color: 'text-orange-400',
    items: [
      { q: 'Who can see my files?', a: 'Only you and users you invite. File links use short, unguessable random IDs and are never listed publicly. Stored securely with row-level security.' },
      { q: 'How do I delete a file?', a: 'Go to My Files, hover over a file card, and click the trash icon. A confirmation dialog prevents accidental deletes.' },
    ],
  },
];

const FAQ = () => {
  const [open, setOpen] = useState({ 0: 0 });

  const toggle = (g, i) =>
    setOpen(prev => ({ ...prev, [g]: prev[g] === i ? null : i }));

  return (
    <section id="faq" className="py-20 sm:py-28 bg-[#0c0c14] relative">
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-flex bg-white/[0.04] border border-white/10 rounded-full px-4 py-1.5 text-xs text-gray-400 mb-5">Got questions?</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">Frequently asked questions</h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
            Everything you need to know about CodeShare. Can't find what you're looking for?{' '}
            <a href="mailto:codeshare.solution@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors">Email us</a>.
          </p>
        </div>

        {/* FAQ groups */}
        <div className="space-y-8">
          {faqs.map((group, g) => (
            <div key={g}>
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-[10px] font-black uppercase tracking-widest ${group.color}`}>{group.category}</span>
                <div className="flex-1 h-px bg-white/[0.05]" />
              </div>

              <div className="space-y-2">
                {group.items.map((item, i) => {
                  const isOpen = open[g] === i;
                  return (
                    <div key={i} className={`rounded-xl border overflow-hidden transition-colors duration-200 ${isOpen ? 'border-blue-500/25' : 'border-white/[0.05]'}`}>
                      <button
                        onClick={() => toggle(g, i)}
                        className={`w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-150 ${isOpen ? 'bg-blue-500/[0.06]' : 'bg-white/[0.02] hover:bg-white/[0.04]'}`}
                      >
                        <span className={`text-sm font-semibold leading-snug ${isOpen ? 'text-white' : 'text-gray-400'}`}>{item.q}</span>
                        <svg
                          className={`w-4 h-4 flex-shrink-0 transition-all duration-200 ${isOpen ? 'rotate-180 text-blue-400' : 'text-gray-600'}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div className={`faq-answer-wrap ${isOpen ? 'faq-answer-visible' : ''}`}>
                        <p className="px-5 py-4 text-sm text-gray-400 leading-relaxed bg-blue-500/[0.03] border-t border-white/[0.04]">{item.a}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
