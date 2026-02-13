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
    name: "Tanya R.",
    role: "Interior Designer",
    location: "Nashville, TN",
    quote: "I spent three weekends Googling 'how to use AI for my business' and ended up more confused than when I started. A friend sent me JumpinAI. I typed two things in and got back something that actually made me go 'oh — that's what I should be doing.' Implemented the first phase that same week. Wish I'd found this before wasting a month going in circles.",
    highlight: "Ended a month of going in circles",
    avatar: "TR",
  },
  {
    name: "Greg S.",
    role: "SaaS Co-founder",
    location: "Portland, OR",
    quote: "We were about to hire someone full-time just to figure out our AI strategy. Ran a Jump instead, mostly out of curiosity. The roadmap was so specific to our stack and our bottlenecks that we cancelled the job posting. Built two automations off the back of it and onboarded our team in a week. Saved us a salary.",
    highlight: "Cancelled a job posting",
    avatar: "GS",
  },
  {
    name: "Nina V.",
    role: "Veterinary Clinic Owner",
    location: "Raleigh, NC",
    quote: "I treat animals, not spreadsheets. But I was spending more time on the business side than the clinical side and it was burning me out. I tried JumpinAI not expecting much — and walked away with a plan so tailored to my clinic that my office manager thought I'd hired a consultant. Three weeks in, we're running automations I didn't know were possible for a practice our size.",
    highlight: "More time with patients",
    avatar: "NV",
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
