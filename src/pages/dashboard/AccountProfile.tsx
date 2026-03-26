import ProfileTabs from "@/components/profile/ProfileTabs";

export default function AccountProfile() {
  return (
    <div className="min-h-screen relative">
      {/* Premium floating background elements with liquid glass effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Main gradient orbs with enhanced blur and liquid animation */}
        <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-56 sm:w-[28rem] h-56 sm:h-[28rem] bg-gradient-to-br from-primary/20 sm:from-primary/25 via-primary/10 sm:via-primary/15 to-primary/5 rounded-full blur-2xl sm:blur-3xl animate-pulse opacity-50 sm:opacity-60"></div>
        <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-64 sm:w-[32rem] h-64 sm:h-[32rem] bg-gradient-to-tr from-secondary/15 sm:from-secondary/20 via-accent/8 sm:via-accent/10 to-secondary/5 rounded-full blur-2xl sm:blur-3xl animate-pulse opacity-40 sm:opacity-50" style={{animationDelay: '2s'}}></div>
        
        {/* Liquid glass floating elements - hidden on mobile for cleaner look */}
        <div className="hidden sm:block absolute top-1/4 left-1/3 w-72 h-72 bg-gradient-conic from-primary/15 via-accent/10 to-secondary/15 rounded-full blur-2xl animate-pulse opacity-40" style={{animationDelay: '1s'}}></div>
        <div className="hidden sm:block absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-radial from-accent/20 via-primary/10 to-transparent rounded-full blur-xl animate-pulse opacity-30" style={{animationDelay: '3s'}}></div>
        
        {/* Subtle mesh gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/3 sm:via-primary/5 to-transparent opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/2 sm:via-accent/3 to-transparent opacity-40"></div>
      </div>
      
      <div className="relative animate-fade-in">
        <ProfileTabs />
      </div>
    </div>
  );
}
