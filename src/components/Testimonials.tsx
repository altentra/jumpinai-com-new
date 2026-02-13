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
    name: "Jake Morrison",
    role: "Real Estate Agent",
    location: "Denver, CO",
    quote: "Every other agent in my office started using AI last year but none of them could explain what they were actually doing with it. I ran a Jump on a Sunday night and by Wednesday I had automated my entire listing description process and my follow-up emails. My broker asked me how I suddenly had time to take on 4 extra clients. I just smiled. Seriously though — the plan was so specific to real estate that it felt like someone in my industry wrote it.",
    highlight: "4 extra clients per month",
    avatar: "JM",
  },
  {
    name: "Aaliyah Brooks",
    role: "Etsy Shop Owner · Handmade Jewelry",
    location: "Atlanta, GA",
    quote: "I'm a one-person operation and I was drowning in product photos, descriptions, customer messages, all of it. A friend sent me JumpinAI and I thought it was gonna be another generic 'use ChatGPT for everything' thing. It wasn't. It mapped out exactly which tools fit MY workflow and gave me the prompts ready to go. Then I used the automation builder and now my order confirmations and review requests run on autopilot. I got my weekends back.",
    highlight: "Reclaimed 12+ hrs/week",
    avatar: "AB",
  },
  {
    name: "Tom Kessler",
    role: "Operations Manager · SaaS Startup",
    location: "Austin, TX",
    quote: "We were paying for like six different AI tools and nobody on the team knew which one to use for what. Total mess. I ran a Jump for our ops workflow and it basically audited everything — told us which tools actually mattered, which ones we were wasting money on, and how to connect them. We cut two subscriptions the same week and the workflow JumpinAI built for us replaced a process that used to take our intern three hours every Monday.",
    highlight: "Cut 2 redundant AI tools",
    avatar: "TK",
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
