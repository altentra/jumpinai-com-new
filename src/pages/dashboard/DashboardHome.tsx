import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, Sparkles, GitBranch, Boxes, Lightbulb, ChevronRight, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const DashboardHome = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // First try to get from profiles table
          const { data: profile } = await (supabase.from("profiles" as any) as any)
            .select('display_name')
            .eq('id', user.id)
            .single();
          
          if (profile?.display_name) {
            setUserName(profile.display_name);
          } else if (user.user_metadata?.display_name) {
            setUserName(user.user_metadata.display_name);
          } else {
            // Fallback to email name part
            const emailName = user.email?.split('@')[0] || '';
            setUserName(emailName);
          }
        }
      } catch (error) {
        console.error('Error fetching user name:', error);
      }
    };
    
    fetchUserName();
  }, []);

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
      title: "My Jumps in AI",
      description: "Explore and manage your AI jumps",
      icon: Rocket,
      path: "/dashboard/jumps",
      color: "text-blue-500"
    },
    {
      title: "My Prompts", 
      description: "Create and organize your prompts",
      icon: Sparkles,
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
        <h1 className="text-4xl font-bold gradient-text-primary mb-3">
          Welcome{userName ? `, ${userName}` : ""}, to JumpinAI!
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your AI-powered dashboard is ready. Explore your tools, manage your projects, and accelerate your AI journey.
        </p>
      </div>

      {/* Pro Subscription Card */}
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

      {/* Dashboard Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up animate-delay-200">
        {dashboardSections.map((section, index) => (
          <Card 
            key={section.title}
            className="border-border hover:shadow-modern transition-all duration-300 cursor-pointer group"
            onClick={() => navigate(section.path)}
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
        ))}
      </div>
    </div>
  );
};

export default DashboardHome;