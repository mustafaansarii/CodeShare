import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqData = [
    {
      id: 1,
      question: "What makes CodeShare different from other code editors?",
      answer: "CodeShare combines the power of real-time collaboration with instant code compilation, secure sharing, and team management features - all in one intuitive platform. Unlike traditional editors, we focus on making code sharing and collaboration seamless and secure.",
    },
    {
      id: 2,
      question: "How does the real-time collaboration feature work?",
      answer: "Multiple users can work on the same code simultaneously. Changes are synchronized instantly, and you can see who's editing what in real-time. Our platform also includes features like cursor presence, chat, and version history to enhance collaboration.",
    },
    {
      id: 3,
      question: "What security measures are in place?",
      answer: "We implement end-to-end encryption for all code snippets, secure authentication, and granular access controls. You can choose to make snippets public, private, or share them with specific team members. All data is encrypted at rest and in transit.",
    },
    {
      id: 4,
      question: "What are the key features of CodeShare?",
      answer: "Key features include real-time collaboration, instant code compilation, secure code sharing, team management, version control, syntax highlighting for multiple languages, and a powerful VS Code extension for seamless integration with your workflow.",
    },
    {
      id: 5,
      question: "How can I get started with CodeShare?",
      answer: "Simply sign up for a free account, and you can immediately start creating and sharing code snippets. You can also install our VS Code extension for enhanced functionality. Premium features are available through our subscription plans.",
    },
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-4xl font-bold text-center mb-12 text-white">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div 
              key={item.id} 
              className="rounded-xl backdrop-blur-sm bg-white/5 border border-white/10 overflow-hidden hover:shadow-pink-500/20 transition-all duration-300"
            >
              <button
                className="flex items-center justify-between w-full py-5 px-6 text-left text-white font-semibold hover:bg-white/5 transition-colors duration-200"
                onClick={() => toggleAccordion(index)}
                aria-expanded={activeIndex === index}
              >
                <span className="text-lg">{item.question}</span>
                {activeIndex === index ? (
                  <FaChevronUp className="w-5 h-5 text-pink-500" />
                ) : (
                  <FaChevronDown className="w-5 h-5 text-pink-500" />
                )}
              </button>
              <div
                className={`px-6 pb-5 text-gray-300 leading-relaxed transition-all duration-300 overflow-hidden ${
                  activeIndex === index ? 'block' : 'hidden'
                }`}
              >
                {item.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
