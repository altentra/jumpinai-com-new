import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, Sparkles, GitBranch, Boxes, Lightbulb, ChevronRight, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

// Memoized dashboard section card for better performance
const DashboardCard = React.memo(({ section, onClick }: { 
  section: { title: string; description: string; icon: any; path: string; color: string }; 
  onClick: () => void;
}) => (
  <Card 
    className="border-border hover:shadow-modern transition-all duration-300 cursor-pointer group"
    onClick={onClick}
  >
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center justify-between text-lg">
        <div className="flex items-center gap-3">
          <section.icon className={`h-5 w-5 ${section.color}`} />
          <span>{section.title}</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-sm">
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
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center py-8 animate-fade-in-down">
        <div className="flex items-center justify-center gap-3 mb-3">
          <h1 className="text-4xl font-bold gradient-text-primary">
            Welcome{user?.display_name ? `, ${user.display_name}` : ""}, to JumpinAI!
          </h1>
          {subscription && (
            <Badge className={subscription.subscribed ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground"}>
              {subscription.subscribed ? subscription.subscription_tier || 'Pro Plan' : 'Free Plan'}
            </Badge>
          )}
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your AI-powered dashboard is ready. Explore your tools, manage your projects, and accelerate your AI journey.
        </p>
      </div>

      {/* Pro Subscription Card - Only show if not subscribed */}
      {subscription && !subscription.subscribed && (
        <Card className="border-border glass animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" /> Upgrade to JumpinAI Pro
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Get all digital products with ongoing updates for just $10/month.
          </CardContent>
          <CardFooter>
            <Button onClick={subscribe} className="modern-button">Get Pro</Button>
          </CardFooter>
        </Card>
      )}

      {/* Dashboard Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up animate-delay-200">
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