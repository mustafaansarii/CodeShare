import { useState } from 'react';

const faqs = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'Is CodeShare free to use?',
        a: 'Yes — 100% free. You can sign up with just your email and immediately start creating files, writing code, and sharing with others. No credit card, no limits on file count.',
      },
      {
        q: 'Do I need to install anything?',
        a: 'Nothing at all. CodeShare runs entirely in your browser, powered by the Monaco Editor (the same engine as VS Code). Just open the site, sign up, and start coding.',
      },
      {
        q: 'Which programming languages are supported?',
        a: 'Python and Java are fully supported with live code execution powered by our backend compiler. The editor also provides syntax highlighting for JavaScript, C++, and others in "Other" mode — though execution is not available for those yet.',
      },
    ],
  },
  {
    category: 'Collaboration',
    items: [
      {
        q: 'How does real-time collaboration work?',
        a: 'When you share a document, any user with edit access can open the same link and type simultaneously. Changes are synced across all tabs in real time via WebSocket (Supabase Realtime), so everyone sees updates instantly without refreshing.',
      },
      {
        q: 'How do I give someone edit access?',
        a: 'Open the document, click the Share button in the top-right corner of the editor, and enter the email address of the person you want to invite. They\'ll be able to open the same link and edit the file. You can also remove their access from the same panel at any time.',
      },
      {
        q: 'Can someone view my code without an account?',
        a: 'Yes. Anyone with the document link can view and run the code without signing in. Edit access requires a CodeShare account and an explicit invite from the document owner.',
      },
    ],
  },
  {
    category: 'Editor & Execution',
    items: [
      {
        q: 'How do I run code and pass input to it?',
        a: 'Select your language from the top toolbar, write your code in the editor, then type any stdin input in the Input box on the right panel and click Run. Output and execution time appear in the Output box immediately.',
      },
      {
        q: 'Can I collapse the Input/Output panel?',
        a: 'Yes. Click the small arrow button (‹ ›) on the vertical divider between the editor and the I/O panel to hide or show it. This gives you a full-screen editor experience when you don\'t need the output panel.',
      },
      {
        q: 'Are my files saved automatically?',
        a: 'Yes. Every keystroke is auto-saved to the cloud in real time. You never need to hit Ctrl+S — just close the tab and your code will be exactly where you left it when you return.',
      },
    ],
  },
  {
    category: 'Privacy & Security',
    items: [
      {
        q: 'Who can see my files?',
        a: 'Only you and users you explicitly invite can see or edit your documents. File links use short, unguessable random IDs, and no file is listed publicly. Your code is stored securely in Supabase with row-level security.',
      },
      {
        q: 'How do I rename or delete a file?',
        a: 'Inside the editor, click the pencil icon next to the file name at the top to rename it. To delete a file, go to My Files, hover over the file card, and click the trash icon — a confirmation dialog will appear to prevent accidental deletes.',
      },
    ],
  },
];

const ChevronIcon = ({ open }) => (
  <svg
    className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-blue-400' : ''}`}
    fill="none" stroke="currentColor" viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const FAQ = () => {
  const [open, setOpen] = useState({ 0: 0 }); // { groupIdx: itemIdx }

  const toggle = (g, i) => {
    setOpen(prev => {
      const same = prev[g] === i;
      return same ? { ...prev, [g]: null } : { ...prev, [g]: i };
    });
  };

  return (
    <section id="faq" className="py-28 bg-[#0a0a0f] relative">
      {/* subtle grid bg */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-gray-400 mb-6">
            Got questions?
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Frequently asked questions
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            Everything you need to know about CodeShare. Can't find what you're looking for?{' '}
            <a href="mailto:codeshare.solution@gmail.com" className="text-blue-400 hover:underline">Email us</a>.
          </p>
        </div>

        {/* FAQ groups */}
        <div className="space-y-8">
          {faqs.map((group, g) => (
            <div key={g}>
              {/* Category label */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">{group.category}</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              {/* Items */}
              <div className="space-y-2">
                {group.items.map((item, i) => {
                  const isOpen = open[g] === i;
                  return (
                    <div
                      key={i}
                      className="rounded-xl overflow-hidden border transition-colors duration-200"
                      style={{ borderColor: isOpen ? 'rgba(96,165,250,0.25)' : 'rgba(255,255,255,0.05)' }}
                    >
                      <button
                        onClick={() => toggle(g, i)}
                        className={`w-full flex items-center justify-between gap-4 px-6 py-4 text-left transition-colors ${isOpen ? 'bg-blue-500/[0.06]' : 'bg-white/[0.02] hover:bg-white/[0.04]'}`}
                      >
                        <span className={`text-sm font-medium leading-snug ${isOpen ? 'text-white' : 'text-gray-300'}`}>
                          {item.q}
                        </span>
                        <ChevronIcon open={isOpen} />
                      </button>

                      {isOpen && (
                        <div className="px-6 pb-5 pt-1 bg-blue-500/[0.03] border-t border-white/5">
                          <p className="text-sm text-gray-400 leading-relaxed">{item.a}</p>
                        </div>
                      )}
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
