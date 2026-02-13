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
    name: "David K.",
    role: "Operations Director",
    location: "Denver, CO",
    quote: "I kept telling my team we needed to 'do something with AI' but honestly had no idea where to start. After one Jump, I had a plan I wasn't embarrassed to present. Two weeks later we had our first automated workflow running. My boss asked who I hired — I just smiled.",
    highlight: "From clueless to confident",
    avatar: "DK",
  },
  {
    name: "Samira E.",
    role: "Independent Consultant",
    location: "Toronto, ON",
    quote: "I'd spent months watching tutorials, saving bookmarks, trying free trials — and still felt behind. JumpinAI didn't just tell me what tools to use, it showed me exactly how they fit my situation. For the first time, AI stopped feeling like everyone else's advantage and started feeling like mine.",
    highlight: "Finally stopped falling behind",
    avatar: "SE",
  },
  {
    name: "Jason M.",
    role: "Agency Founder",
    location: "Atlanta, GA",
    quote: "I was paying a contractor $4K/month for work that my team can now handle in-house with the workflows we built through the platform. The ROI hit me when I realized we'd reclaimed an entire role's worth of output. That's not efficiency — that's a different business.",
    highlight: "$4K/month saved",
    avatar: "JM",
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
    <div className="relative flex flex-col h-full rounded-[1.25rem] border border-white/[0.10] bg-white/[0.03] backdrop-blur-md p-7 sm:p-9 overflow-hidden group-hover:border-white/[0.18] group-hover:bg-white/[0.05] transition-all duration-500">
      {/* Top shimmer */}
      <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {/* Bottom shimmer */}
      <div className="absolute inset-x-10 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Card header — highlight metric */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/[0.08] border border-primary/[0.12] flex items-center justify-center flex-shrink-0">
            <Quote className="h-3.5 w-3.5 text-primary/60" strokeWidth={2} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">
            {testimonial.highlight}
          </span>
        </div>
      </div>

      {/* Quote text */}
      <blockquote className="flex-1 text-[0.84rem] sm:text-[0.9rem] leading-[1.7] text-white/55 mb-7 font-light">
        "{testimonial.quote}"
      </blockquote>

      {/* Divider */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-5" />

      {/* Author */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.10] flex items-center justify-center flex-shrink-0">
          <span className="text-[11px] font-semibold text-white/45 tracking-wider">{testimonial.avatar}</span>
        </div>
        <div className="min-w-0">
          <p className="text-[0.8rem] font-semibold text-white/80 tracking-wide">{testimonial.name}</p>
          <p className="text-[10.5px] text-white/30 tracking-wide mt-0.5">{testimonial.role} · {testimonial.location}</p>
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
    <section ref={sectionRef} className="py-16 sm:py-24 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[250px] bg-gradient-to-r from-primary/[0.02] via-accent/[0.04] to-primary/[0.02] rounded-full blur-[80px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Section header */}
          <div
            className="text-center mb-12 sm:mb-16 transition-all duration-700"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
            }}
          >
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-white/25 mb-3">
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
