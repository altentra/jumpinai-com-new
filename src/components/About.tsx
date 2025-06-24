
import { Lightbulb, Rocket, Users } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: Lightbulb,
      title: "Clear Guidance",
      description: "We cut through the noise to bring you crystal-clear insights and actionable advice in the ever-evolving AI landscape.",
      gradient: "from-gray-600 to-gray-800 dark:from-gray-400 dark:to-gray-600"
    },
    {
      icon: Rocket,
      title: "Professional Approach", 
      description: "We believe AI adoption should be strategic and impactful. Our content is designed to drive real business results.",
      gradient: "from-gray-700 to-black dark:from-gray-300 dark:to-gray-500"
    },
    {
      icon: Users,
      title: "Expert Community",
      description: "We're building a community of AI professionals who share proven strategies and industry best practices.",
      gradient: "from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-400"
    }
  ];

  return (
    <section id="about" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20 scroll-snap-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-5xl sm:text-6xl font-black text-foreground mb-6 tracking-tight font-display">
            Who We Are
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-gray-800 to-black dark:from-white dark:to-gray-300 mx-auto mb-8 rounded-full"></div>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
            We're dedicated AI professionals on a mission to make artificial intelligence strategic, practical, and results-driven for forward-thinking organizations.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div key={index} className={`group relative bg-card rounded-3xl p-8 shadow-modern hover:shadow-modern-lg transition-all duration-500 hover:-translate-y-2 border border-border animate-fade-in-up animate-delay-${(index + 1) * 100}`}>
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-background rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="relative mb-8">
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
                  <div className={`relative bg-gradient-to-r ${feature.gradient} p-4 rounded-2xl inline-block`}>
                    <feature.icon className="h-8 w-8 text-white dark:text-black" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-foreground transition-all duration-500 font-display">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed font-light">
                  {feature.description}
                </p>
              </div>
              
              {/* Hover Border Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-gray-800 to-black dark:from-white dark:to-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
