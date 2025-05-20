import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqData = [
    {
      id: 1,
      question: "What is SnipShare?",
      answer: "SnipShare is a real-time code sharing and collaboration platform designed to enhance teamwork and creativity among developers.",
    },
    {
      id: 2,
      question: "How does real-time code sharing work?",
      answer: "Our platform allows multiple users to simultaneously view and edit code, fostering seamless collaboration and immediate feedback.",
    },
    {
      id: 3,
      question: "Is SnipShare secure?",
      answer: "Yes, we prioritize security with advanced encryption and private snippet options to ensure your code remains protected.",
    },
    {
      id: 4,
      question: "Can I use SnipShare for free?",
      answer: "We offer a free tier with basic features. For advanced functionalities and increased usage, we have premium subscription plans available.",
    },
    {
      id: 5,
      question: "What kind of code can I share?",
      answer: "You can share code in various programming languages, including JavaScript, Python, HTML, CSS, and more.",
    },
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-7xl lg:max-w-[1000px]">
        <h2 className="text-3xl font-semibold text-center mb-8 text-yellow-400">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div key={item.id} className="rounded-lg border border-gray-700 overflow-hidden">
              <button
                className="flex items-center justify-between w-full py-4 px-6 text-left text-white font-semibold hover:bg-gray-800 transition-colors duration-200"
                onClick={() => toggleAccordion(index)}
                aria-expanded={activeIndex === index}
              >
                {item.question}
                {activeIndex === index ? (
                  <FaChevronUp className="w-5 h-5" />
                ) : (
                  <FaChevronDown className="w-5 h-5" />
                )}
              </button>
              <div
                className={`px-6 pb-4 text-gray-300 leading-relaxed transition-all duration-300 overflow-hidden ${
                  activeIndex === index ? 'block' : 'hidden'
                }`}
              >
                {item.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
