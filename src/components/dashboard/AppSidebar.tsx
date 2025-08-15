import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Settings, Home, FileText, Workflow, Lightbulb, Boxes, ChevronDown } from "lucide-react";

interface SubscriberInfo {
  subscribed: boolean;
  subscription_tier?: string | null;
  subscription_end?: string | null;
}

export default function AppSidebar() {
  const { setOpenMobile, isMobile } = useSidebar();
  const { pathname: currentPath } = useLocation();
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [subInfo, setSubInfo] = useState<SubscriberInfo | null>(null);

  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [currentPath, isMobile, setOpenMobile]);

  useEffect(() => {
    const fetchUserData = async () => {
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
          
          // Fetch subscription status
          await refreshSubscription();
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
    
    // Listen for profile updates
    const handleProfileUpdate = () => {
      fetchUserData();
    };
    
    window.addEventListener('profile-updated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, []);

  const refreshSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setSubInfo(data as SubscriberInfo);
    } catch (e: any) {
      console.error('Error fetching subscription:', e);
    }
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  return (
    <div className="flex h-full w-64 flex-col bg-background border-r border-border">
      {/* Welcome Section - Moved to Top */}
      <div className="p-4 border-b border-border">
        <div className="text-sm text-muted-foreground mb-1">
          Welcome{userName ? `, ${userName}` : ""}, to JumpinAI!
        </div>
        {subInfo && (
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              subInfo.subscribed ? "border-primary/20 text-primary" : "border-muted text-muted-foreground"
            )}
          >
            {subInfo.subscribed ? subInfo.subscription_tier || 'JumpinAI Pro' : 'Free Plan'}
          </Badge>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          <Link 
            to="/dashboard" 
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              getNavCls({ isActive: currentPath === "/dashboard" })
            )}
          >
            <Home className="h-4 w-4" />
            Overview
          </Link>

          <Link 
            to="/dashboard/jumps" 
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              getNavCls({ isActive: currentPath === "/dashboard/jumps" })
            )}
          >
            <FileText className="h-4 w-4" />
            My Jumps in AI
          </Link>

          <Link 
            to="/dashboard/prompts" 
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              getNavCls({ isActive: currentPath === "/dashboard/prompts" })
            )}
          >
            <FileText className="h-4 w-4" />
            My Prompts
          </Link>

          <Link 
            to="/dashboard/workflows" 
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              getNavCls({ isActive: currentPath === "/dashboard/workflows" })
            )}
          >
            <Workflow className="h-4 w-4" />
            My Workflows
          </Link>

          <Link 
            to="/dashboard/blueprints" 
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              getNavCls({ isActive: currentPath === "/dashboard/blueprints" })
            )}
          >
            <Boxes className="h-4 w-4" />
            My Blueprints
          </Link>

          <Link 
            to="/dashboard/strategies" 
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              getNavCls({ isActive: currentPath === "/dashboard/strategies" })
            )}
          >
            <Lightbulb className="h-4 w-4" />
            My Strategies
          </Link>

          {/* Analytics Section */}
          <Collapsible open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
            <CollapsibleTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted/50 transition-colors w-full">
              <Settings className="h-4 w-4" />
              Analytics
              <ChevronDown className="h-4 w-4 ml-auto" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="ml-6 space-y-1 mt-1">
                <Link 
                  to="/dashboard/analytics" 
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    getNavCls({ isActive: currentPath === "/dashboard/analytics" })
                  )}
                >
                  Dashboard
                </Link>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-border">
          <Link 
            to="/dashboard/profile" 
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted/50 transition-colors",
              getNavCls({ isActive: currentPath === "/dashboard/profile" })
            )}
          >
            <User className="h-4 w-4" />
            Profile & Settings
          </Link>
        </div>
      </div>
    </div>
  );
}