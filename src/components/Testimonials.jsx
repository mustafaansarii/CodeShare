import { FaQuoteLeft, FaUserCircle } from 'react-icons/fa';

const testimonials = [
  {
    id: 1,
    name: "John Doe",
    title: "Software Engineer",
    company: "Tech Innovations Inc.",
    quote:
      "SnipShare has revolutionized the way we collaborate on code. Real-time sharing and secure snippets have boosted our productivity significantly.",
  },
  {
    id: 2,
    name: "Alice Smith",
    title: "Web Developer",
    company: "Web Solutions Ltd.",
    quote:
      "The easy snippet sharing feature is a game-changer. I can quickly share code with my team and get feedback instantly. Highly recommended!",
  },
  {
    id: 3,
    name: "Bob Johnson",
    title: "Data Scientist",
    company: "Data Insights Corp.",
    quote:
      "SnipShare's private and secure environment ensures our sensitive code remains protected. It's a must-have tool for any data science team.",
  },
];

const Testimonials = () => {
  return (
    <div className="py-16 ">
      <div className="container mx-auto px-4 max-w-7xl lg:max-w-[1200px]">
        <h2 className="text-3xl font-semibold text-center mb-8 text-yellow-400">
          What Our Users Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="rounded-lg border border-gray-700 p-6"
            >
              <div className="flex items-center mb-4">
                <FaUserCircle className="w-12 h-12 rounded-full mr-4 text-gray-500" />
                <div>
                  <h3 className="text-lg font-semibold text-white">{testimonial.name}</h3>
                  <p className="text-gray-400 text-sm">
                    {testimonial.title}, {testimonial.company}
                  </p>
                </div>
              </div>
              <p className="text-gray-300 italic leading-relaxed"><FaQuoteLeft className="inline-block mr-1" />{testimonial.quote}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
