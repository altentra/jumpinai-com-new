
import { GraduationCap, Briefcase, Palette, Users } from "lucide-react";

const WhoItsFor = () => {
  const audiences = [
    {
      icon: Palette,
      title: "Creators",
      description: "Professional content creators and designers looking to enhance their creative process with cutting-edge AI tools and workflows.",
      features: ["AI content generation", "Creative automation", "Professional workflows", "Industry tools"],
      gradient: "from-gray-600 to-gray-800 dark:from-gray-400 dark:to-gray-600",
      userCount: "10K+ Creators"
    },
    {
      icon: Briefcase,
      title: "Entrepreneurs", 
      description: "Business leaders and startup founders ready to integrate AI into their operations and scale with strategic intelligence.",
      features: ["Business automation", "Market intelligence", "Product development", "Growth strategies"],
      gradient: "from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-500",
      userCount: "5K+ Entrepreneurs"
    },
    {
      icon: GraduationCap,
      title: "Professionals",
      description: "Industry professionals and researchers who want to master AI applications in their field and advance their expertise.",
      features: ["Professional development", "Research tools", "Industry insights", "Career advancement"],
      gradient: "from-gray-800 to-black dark:from-gray-200 dark:to-gray-400",
      userCount: "15K+ Professionals"
    }
  ];

  return (
    <section id="who-its-for" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20 scroll-snap-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center px-4 py-2 bg-muted rounded-full mb-6">
            <Users className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-sm font-semibold text-muted-foreground">Our Community</span>
          </div>
          
          <h2 className="text-5xl sm:text-6xl font-black text-foreground mb-6 tracking-tight font-display">
            Who It's For
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-gray-800 to-black dark:from-white dark:to-gray-300 mx-auto mb-8 rounded-full"></div>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
            Whether you're creating, building, or leading, we have the AI expertise you need to succeed and drive meaningful results.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {audiences.map((audience, index) => (
            <div key={index} className={`group relative animate-fade-in-up animate-delay-${(index + 1) * 100}`}>
              {/* User Count Badge - positioned outside the card */}
              <div className="absolute -top-4 -right-4 z-20">
                <div className={`bg-gradient-to-r ${audience.gradient} text-white dark:text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg`}>
                  {audience.userCount}
                </div>
              </div>

              {/* Main Card */}
              <div className="relative bg-card rounded-3xl p-8 shadow-modern hover:shadow-modern-lg transition-all duration-500 hover:-translate-y-2 border border-border h-full overflow-hidden">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${audience.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="relative mb-8">
                    <div className={`absolute inset-0 bg-gradient-to-r ${audience.gradient} rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    <div className={`relative bg-gradient-to-r ${audience.gradient} p-4 rounded-2xl inline-block group-hover:scale-110 transition-transform duration-500`}>
                      <audience.icon className="h-8 w-8 text-white dark:text-black" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-foreground transition-all duration-500 font-display">
                    {audience.title}
                  </h3>
                  <p className="text-muted-foreground mb-8 leading-relaxed font-light">
                    {audience.description}
                  </p>
                  
                  {/* Features List */}
                  <ul className="space-y-3">
                    {audience.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-muted-foreground font-light">
                        <div className={`w-2 h-2 bg-gradient-to-r ${audience.gradient} rounded-full mr-3 flex-shrink-0`}></div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute bottom-0 right-0 w-24 h-24 opacity-5">
                  <div className={`w-full h-full bg-gradient-to-tl ${audience.gradient} rounded-tl-full`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoItsFor;
