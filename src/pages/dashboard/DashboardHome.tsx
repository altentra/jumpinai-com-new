import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, GitBranch, Boxes, Lightbulb, ChevronRight, Palette, ArrowRight, Wrench, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardActivityGraph } from "@/components/dashboard/DashboardActivityGraph";
import { dashboardStatsService } from "@/services/dashboardStatsService";
import type { DashboardStats as StatsType, ActivityData } from "@/services/dashboardStatsService";

// Memoized dashboard section card for better performance
const DashboardCard = React.memo(({ section, onClick }: { 
  section: { title: string; description: string; icon: any; path: string; color: string }; 
  onClick: () => void;
}) => (
  <Card 
    className="glass border-border hover:shadow-modern-lg transition-all duration-300 cursor-pointer group rounded-xl"
    onClick={onClick}
  >
    <CardHeader className="pb-2">
      <CardTitle className="flex items-center justify-between text-base">
        <div className="flex items-center gap-2.5">
          <section.icon className={`h-4 w-4 ${section.color}`} />
          <span>{section.title}</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      <CardDescription className="text-xs">
        {section.description}
      </CardDescription>
    </CardContent>
  </Card>
));

DashboardCard.displayName = 'DashboardCard';

const DashboardHome = () => {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  const [stats, setStats] = useState<StatsType | null>(null);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;

    setIsLoadingStats(true);
    setIsLoadingActivity(true);

    try {
      const [statsData, activityData] = await Promise.all([
        dashboardStatsService.getStats(user.id),
        dashboardStatsService.getActivityData(user.id, 30),
      ]);
      
      setStats(statsData);
      setActivityData(activityData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoadingStats(false);
      setIsLoadingActivity(false);
    }
  };

  const dashboardSections = [
    {
      title: "My Jumps",
      description: "Your personal AI jumps collection",
      icon: Rocket,
      path: "/dashboard/jumps",
      color: "text-blue-500"
    },
    {
      title: "Tools & Prompts", 
      description: "AI tools paired with custom prompts",
      icon: Wrench,
      path: "/dashboard/tools-prompts",
      color: "text-purple-500"
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Welcome Header - Mobile Optimized */}
      <div className="glass rounded-xl border border-border/40 shadow-modern hover:shadow-modern-lg transition-all duration-300 animate-fade-in-down">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col items-center gap-3 mb-3">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold gradient-text-primary text-center leading-tight">
                Welcome{user?.display_name ? `, ${user.display_name}` : ""}!
              </h1>
              {subscription && (
                <Badge className={`${
                  subscription.subscribed 
                    ? "bg-primary/10 text-primary border-primary/20" 
                    : "bg-muted text-muted-foreground border-border"
                } text-xs sm:text-sm px-3 py-1 font-medium shadow-sm`}>
                  {subscription.subscribed ? subscription.subscription_tier || 'Pro Plan' : 'Free Plan'}
                </Badge>
              )}
            </div>
          </div>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed">
            Your AI-powered dashboard is ready. Explore your tools, manage your projects, and accelerate your AI journey.
          </p>
        </div>
      </div>

      {/* Dashboard Stats */}
      {stats && <DashboardStats stats={stats} isLoading={isLoadingStats} />}

      {/* Activity Graph */}
      <DashboardActivityGraph data={activityData} isLoading={isLoadingActivity} />

      {/* JumpinAI Studio Invitation */}
      <Card className="glass border-primary/20 animate-fade-in-up rounded-2xl shadow-modern hover:shadow-modern-lg transition-all duration-300">
        <CardContent className="p-6 sm:p-8 text-center">
          <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="glass p-2 rounded-xl w-fit mx-auto sm:mx-0">
              <Palette className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold gradient-text-primary font-display">Ready to Create Your Next Jump?</h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mb-5 sm:mb-6 max-w-2xl mx-auto leading-relaxed px-2">
            Get your personalized AI transformation plan in 2 minutes. JumpinAI Studio analyzes your unique situation and creates a complete strategic action plan with 9 personalized batches of curated tools and prompts tailored to your exact goals.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6 max-w-2xl mx-auto px-2">
            <div className="glass p-3 rounded-xl">
              <div className="text-base sm:text-lg font-bold text-foreground font-display mb-1">Situational Analysis</div>
              <div className="text-xs text-muted-foreground">Comprehensive assessment</div>
            </div>
            <div className="glass p-3 rounded-xl">
              <div className="text-base sm:text-lg font-bold text-foreground font-display mb-1">Strategic Plan</div>
              <div className="text-xs text-muted-foreground">Step-by-step roadmap</div>
            </div>
            <div className="glass p-3 rounded-xl">
              <div className="text-base sm:text-lg font-bold text-foreground font-display mb-1">9 Tool Batches</div>
              <div className="text-xs text-muted-foreground">Curated for your goals</div>
            </div>
          </div>

          <Button 
            onClick={() => navigate("/jumpinai-studio")}
            className="glass hover:scale-[1.02] px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-2xl transition-all duration-300 shadow-modern hover:shadow-modern-lg group w-full sm:w-auto"
          >
            <span className="gradient-text-primary">Start Your Jump in Studio</span>
            <ArrowRight className="ml-2 h-4 w-4 text-primary group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;