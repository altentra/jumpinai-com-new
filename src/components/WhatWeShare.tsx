
import { Brain, Cog, TrendingUp, Workflow, Sparkles } from "lucide-react";

const WhatWeShare = () => {
  const features = [
    {
      icon: Brain,
      title: "Curated AI Tools",
      description: "Enterprise-grade, tested tools that deliver measurable ROI for real-world business applications.",
      gradient: "from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-500",
      stats: "200+ Tools"
    },
    {
      icon: TrendingUp,
      title: "Strategic Use-Cases",
      description: "Proven examples of AI implementation with clear metrics and business impact analysis.",
      gradient: "from-gray-600 to-gray-800 dark:from-gray-400 dark:to-gray-600",
      stats: "50+ Cases"
    },
    {
      icon: Workflow,
      title: "Professional Workflows",
      description: "Battle-tested integration guides designed for enterprise environments and scalable operations.",
      gradient: "from-gray-800 to-black dark:from-gray-200 dark:to-gray-400",
      stats: "30+ Workflows"
    },
    {
      icon: Cog,
      title: "Expert Insights",
      description: "Industry knowledge and optimization strategies from seasoned AI implementation specialists.",
      gradient: "from-gray-500 to-gray-700 dark:from-gray-500 dark:to-gray-700",
      stats: "100+ Tips"
    }
  ];

  return (
    <section id="what-we-offer" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/20 to-background scroll-snap-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center px-4 py-2 bg-muted rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-sm font-semibold text-muted-foreground">What We Offer</span>
          </div>
          
          <h2 className="text-5xl sm:text-6xl font-black text-foreground mb-6 tracking-tight font-display">
            What We Offer
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-gray-800 to-black dark:from-white dark:to-gray-300 mx-auto mb-8 rounded-full"></div>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
            Everything you need to strategically implement and leverage AI in your organization with confidence and precision.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div key={index} className={`group relative animate-fade-in-up animate-delay-${(index + 1) * 100}`}>
              {/* Main Card */}
              <div className="relative bg-card rounded-3xl p-8 shadow-modern hover:shadow-modern-lg transition-all duration-500 hover:-translate-y-3 border border-border h-full">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                  <div className="w-full h-full bg-gradient-to-br from-foreground to-transparent rounded-bl-full"></div>
                </div>
                
                {/* Stats Badge */}
                <div className="absolute -top-3 -right-3">
                  <div className={`bg-gradient-to-r ${feature.gradient} text-white dark:text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg`}>
                    {feature.stats}
                  </div>
                </div>
                
                {/* Icon */}
                <div className="relative mb-6">
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
                  <div className={`relative bg-gradient-to-r ${feature.gradient} p-4 rounded-2xl inline-block group-hover:scale-110 transition-transform duration-500`}>
                    <feature.icon className="h-8 w-8 text-white dark:text-black" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-800 group-hover:to-black dark:group-hover:from-white dark:group-hover:to-gray-300 transition-all duration-500 font-display">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm font-light">
                  {feature.description}
                </p>
                
                {/* Hover Border Effect */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10 blur-xl`}></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-12 animate-fade-in-up animate-delay-500">
          <p className="text-muted-foreground font-light">
            Join thousands of professionals already implementing AI strategically
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhatWeShare;
