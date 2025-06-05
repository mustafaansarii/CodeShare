import { FaQuoteLeft } from 'react-icons/fa';

const testimonials = [
  {
    id: 1,
    name: "John Doe",
    title: "Software Engineer",
    company: "Tech Innovations Inc.",
    quote:
      "CodeShare has revolutionized the way we collaborate on code. Real-time sharing and secure snippets have boosted our productivity significantly.",
    image: "https://randomuser.me/api/portraits/men/1.jpg"
  },
  {
    id: 2,
    name: "Alice Smith",
    title: "Web Developer",
    company: "Web Solutions Ltd.",
    quote:
      "The easy code sharing feature is a game-changer. I can quickly share code with my team and get feedback instantly. Highly recommended!",
    image: "https://randomuser.me/api/portraits/women/1.jpg"
  },
  {
    id: 3,
    name: "Bob Johnson",
    title: "Data Scientist",
    company: "Data Insights Corp.",
    quote:
      "CodeShare's private and secure environment ensures our sensitive code remains protected. It's a must-have tool for any data science team.",
    image: "https://randomuser.me/api/portraits/men/2.jpg"
  },
];

const Testimonials = () => {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 text-white">
          What Our Users Say
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="rounded-xl backdrop-blur-sm bg-white/5 border border-white/10 p-4 sm:p-6 text-gray-200 shadow-lg hover:shadow-pink-500/20 transition-all duration-300"
            >
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="text-base sm:text-lg font-semibold text-white">{testimonial.name}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    {testimonial.title}, {testimonial.company}
                  </p>
                </div>
              </div>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                <FaQuoteLeft className="inline-block mr-2 text-pink-500" />
                {testimonial.quote}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
