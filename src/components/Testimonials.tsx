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
    name: "Nina T.",
    role: "Social Media Manager",
    location: "Miami, FL",
    quote: "I typed in my role and what I struggle with, and JumpinAI gave me a step-by-step plan with tools I'd never even heard of — plus the exact prompts to use with each one. Within a week I had my content calendar automated. My clients think I hired help. I didn't.",
    highlight: "Content calendar on autopilot",
    avatar: "NT",
  },
  {
    name: "Carlos R.",
    role: "E-commerce Entrepreneur",
    location: "Austin, TX",
    quote: "I was juggling product descriptions, customer replies, and ad copy all by myself. JumpinAI mapped out which AI tools fit each part of my business and showed me how to actually use them. Then I built a workflow right inside the platform and it handles my order follow-ups now. Saved me hours every single week.",
    highlight: "Hours saved every week",
    avatar: "CR",
  },
  {
    name: "Priya D.",
    role: "Marketing Consultant",
    location: "Chicago, IL",
    quote: "A client asked me for an AI strategy and I had two days. I ran a Jump, got a full roadmap with tools, prompts, and a clear plan I could actually present. The client signed a 6-month contract on the spot. JumpinAI made me look like I'd been doing this for years.",
    highlight: "Landed a 6-month contract",
    avatar: "PD",
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
