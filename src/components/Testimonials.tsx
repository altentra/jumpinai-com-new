import React, { useRef, useState, useEffect } from 'react';
import { Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  location: string;
  quote: string;
  highlight: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Maria Gonzalez",
    role: "Freelance Graphic Designer",
    location: "Austin, TX",
    quote: "Honestly? I'd been putting off the whole AI thing for months. Every time I tried to figure it out on my own I'd end up down some rabbit hole and give up. JumpinAI just… laid it all out for me. Like here's what you should use, here's how, go. I set up my client onboarding in maybe two afternoons and now it basically runs itself. Wish I'd found this sooner.",
    highlight: "Cut admin time by 60%",
    avatar: "MG",
  },
  {
    name: "David Chen",
    role: "Small Business Owner · E-commerce",
    location: "Portland, OR",
    quote: "Everyone kept telling me I need AI for my store but nobody could tell me WHERE to start. I ran a Jump and it literally gave me the tools AND the prompts — like ready to copy and use. My product listings used to take me 45 minutes each. Now it's maybe 10. That alone was worth it, but the whole plan opened my eyes to stuff I didn't even know was possible.",
    highlight: "Product listings 4x faster",
    avatar: "DC",
  },
  {
    name: "Priya Sharma",
    role: "Marketing Coordinator",
    location: "Chicago, IL",
    quote: "We were all just using ChatGPT randomly, no strategy at all. After my Jump I had this clear plan mapping tools to each part of our pipeline. But the part that really blew my mind was the automation feature — I clicked a few buttons and JumpinAI actually built me a working n8n workflow. Didn't have to figure out the nodes or connections myself. It just… worked.",
    highlight: "Fully automated social pipeline",
    avatar: "PS",
  },
];

const TestimonialCard = React.memo(({ testimonial, index, isVisible }: {
  testimonial: Testimonial;
  index: number;
  isVisible: boolean;
}) => (
  <div
    className="group relative flex flex-col h-full transition-all duration-700 ease-out"
    style={{
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
      transitionDelay: `${index * 150}ms`,
    }}
  >
    {/* Card */}
    <div className="relative flex flex-col h-full rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-6 sm:p-8 overflow-hidden group-hover:border-white/[0.14] group-hover:bg-white/[0.05] transition-all duration-500">
      {/* Top shimmer */}
      <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Quote icon */}
      <div className="mb-5">
        <Quote className="h-5 w-5 text-white/20" strokeWidth={1.5} />
      </div>

      {/* Highlight badge */}
      <div className="mb-4">
        <span className="inline-block text-[11px] font-bold uppercase tracking-[0.16em] text-primary/80 bg-primary/[0.08] border border-primary/[0.12] rounded-full px-3 py-1">
          {testimonial.highlight}
        </span>
      </div>

      {/* Quote text */}
      <blockquote className="flex-1 text-sm sm:text-[0.9rem] leading-relaxed text-white/60 mb-6">
        "{testimonial.quote}"
      </blockquote>

      {/* Divider */}
      <div className="h-[1px] bg-white/[0.06] mb-5" />

      {/* Author */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-white/50 tracking-wide">{testimonial.avatar}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white/85 truncate">{testimonial.name}</p>
          <p className="text-[11px] text-white/35 truncate">{testimonial.role} · {testimonial.location}</p>
        </div>
      </div>
    </div>
  </div>
));

TestimonialCard.displayName = 'TestimonialCard';

const Testimonials: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-14 sm:py-20 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-gradient-to-r from-primary/[0.03] via-accent/[0.05] to-primary/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Section header */}
          <div
            className="text-center mb-10 sm:mb-14 transition-all duration-700"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
            }}
          >
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 mb-3">
              From Our Community
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white/90 tracking-tight">
              How People Are Adapting With JumpinAI
            </h2>
          </div>

          {/* Testimonial cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.name}
                testimonial={testimonial}
                index={index}
                isVisible={isVisible}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
