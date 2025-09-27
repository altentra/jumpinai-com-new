import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, Sparkles, GitBranch, Boxes, Lightbulb, ChevronRight, Crown, Palette, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

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

  const subscribe = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      const url = (data as any)?.url;
      if (url) window.location.href = url;
    } catch (e: any) {
      toast.error(e.message || "Failed to start checkout");
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
      title: "Jumps in AI Guides",
      description: "Explore and purchase AI guide products",
      icon: Sparkles,
      path: "/dashboard/jumps-guides",
      color: "text-cyan-500"
    },
    {
      title: "My Prompts", 
      description: "Create and organize your prompts",
      icon: Lightbulb,
      path: "/dashboard/prompts",
      color: "text-purple-500"
    },
    {
      title: "My Workflows",
      description: "Build and manage your workflows", 
      icon: GitBranch,
      path: "/dashboard/workflows",
      color: "text-green-500"
    },
    {
      title: "My Blueprints",
      description: "Design your project blueprints",
      icon: Boxes, 
      path: "/dashboard/blueprints",
      color: "text-orange-500"
    },
    {
      title: "My Strategies",
      description: "Plan and execute your strategies",
      icon: Lightbulb,
      path: "/dashboard/strategies", 
      color: "text-yellow-500"
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Welcome Header - Mobile Optimized */}
      <div className="glass rounded-xl p-4 sm:p-6 text-center animate-fade-in-down shadow-modern">
        <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-2 sm:gap-3 mb-3">
          <h1 className="text-xl sm:text-3xl font-bold gradient-text-primary text-center">
            Welcome{user?.display_name ? `, ${user.display_name}` : ""}, to JumpinAI!
          </h1>
          {subscription && (
            <Badge className={`${subscription.subscribed ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground"} text-xs sm:text-sm`}>
              {subscription.subscribed ? subscription.subscription_tier || 'Pro' : 'Free'}
            </Badge>
          )}
        </div>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          Your AI-powered dashboard is ready. Explore your tools, manage your projects, and accelerate your AI journey.
        </p>
      </div>

      {/* JumpinAI Studio Invitation - Mobile Optimized */}
      <Card className="glass border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 animate-fade-in-up rounded-xl shadow-modern">
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-2 sm:gap-3 mb-3">
            <Palette className="h-6 w-6 sm:h-7 sm:w-7 text-primary mx-auto sm:mx-0" />
            <h2 className="text-lg sm:text-xl font-bold gradient-text-primary">Ready to Design Your Next Big Jump?</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4 sm:mb-5 max-w-3xl mx-auto">
            Create a comprehensive AI transformation plan tailored to your life and business. 
            JumpinAI Studio helps you build complete roadmaps with all the necessary tools, prompts, 
            workflows, and strategies for your success journey.
          </p>
          <Button 
            onClick={() => navigate("/jumpinai-studio")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-6 py-2 text-sm sm:text-base font-medium w-full sm:w-auto"
          >
            Start in JumpinAI Studio
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Pro Subscription Card - Mobile Optimized */}
      {subscription && !subscription.subscribed && (
        <Card className="glass border-border animate-fade-in-up rounded-xl shadow-modern">
          <CardHeader className="pb-3 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> 
              Upgrade to JumpinAI Pro
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground pb-3 px-4 sm:px-6">
            Get all digital products with ongoing updates for just $10/month.
          </CardContent>
          <CardFooter className="pt-0 p-4 sm:p-6">
            <Button onClick={subscribe} className="modern-button text-sm w-full sm:w-auto">
              Get Pro
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Dashboard Sections Grid - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 animate-fade-in-up animate-delay-200">
        {dashboardSections.map((section, index) => (
          <DashboardCard 
            key={section.title}
            section={section}
            onClick={() => navigate(section.path)}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardHome;