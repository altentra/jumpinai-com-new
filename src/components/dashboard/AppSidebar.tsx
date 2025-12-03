import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  useSidebar 
} from "@/components/ui/sidebar";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { supabase } from "@/integrations/supabase/client";
import { User, Settings, Home, FileText, Workflow, Lightbulb, Boxes, ChevronDown, CreditCard, Palette, Sparkles, Zap } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth0Token } from "@/hooks/useAuth0Token";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import logoTransparent from "@/assets/logo-transparent.png";

interface SubscriberInfo {
  subscribed: boolean;
  subscription_tier?: string | null;
  subscription_end?: string | null;
}

export default function AppSidebar() {
  const { isMobile, setOpenMobile } = useSidebar();
  const { pathname: currentPath } = useLocation();
  const [userName, setUserName] = useState<string>("");
  const [subInfo, setSubInfo] = useState<SubscriberInfo | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { getAuthHeaders } = useAuth0Token();
  const { creditsBalance } = useCredits();

  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [currentPath, isMobile, setOpenMobile]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Use display_name from profiles table, fallback to email username
      setUserName(user?.display_name || user?.email?.split('@')[0] || "");
      refreshSubscription();
    }

    // Listen for profile updates
    const handleProfileUpdate = () => {
      if (user) {
        setUserName(user?.display_name || user?.email?.split('@')[0] || "");
      }
      refreshSubscription();
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('profile-updated', handleProfileUpdate);
  }, [isAuthenticated, user]);

  const refreshSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: await getAuthHeaders(),
      });
      if (error) throw error;
      setSubInfo(data as SubscriberInfo);
    } catch (e: any) {
      console.error('Error fetching subscription:', e);
    }
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl border border-primary/20 text-foreground font-medium" 
      : "hover:bg-gradient-to-br hover:from-primary/10 hover:via-accent/5 hover:to-primary/10 hover:backdrop-blur-xl hover:border hover:border-primary/20";

  return (
    <Sidebar className="w-52 mt-20 md:mt-16">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-2 pt-4">
        <Link 
          to="/dashboard/profile" 
          className={cn(
            "flex items-center justify-center gap-2.5 mb-2 rounded-xl px-3 py-2 transition-all duration-300",
            "hover:bg-gradient-to-br hover:from-primary/10 hover:via-accent/5 hover:to-primary/10 hover:backdrop-blur-xl hover:border hover:border-primary/20",
            currentPath === "/dashboard/profile" 
              ? "bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl border border-primary/20" 
              : "border border-transparent"
          )}
        >
          <Avatar className="h-8 w-8">
            {user?.avatar_url ? (
              <AvatarImage src={user.avatar_url} alt={userName} />
            ) : (
              <div className="relative h-full w-full flex items-center justify-center bg-background">
                <img 
                  src={logoTransparent} 
                  alt="JumpinAI" 
                  className="h-6 w-6 opacity-40 brightness-200"
                />
              </div>
            )}
            <AvatarFallback className="text-xs">
              {userName?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground">{userName || 'User'}</span>
        </Link>
        {subInfo && (
          <div className="flex justify-center mb-2">
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs w-fit px-2 py-0.5",
                subInfo.subscribed ? "border-primary/20 text-primary" : "border-muted text-muted-foreground"
              )}
            >
              {subInfo.subscribed ? subInfo.subscription_tier || 'Free Plan' : 'Free Plan'}
            </Badge>
          </div>
        )}
        <div className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/8 dark:to-accent/8 rounded-lg px-2.5 py-1.5 border border-primary/20">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="text-sm font-semibold text-foreground">{creditsBalance}</span>
          <span className="text-xs text-muted-foreground">{creditsBalance === 1 ? 'credit' : 'credits'}</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5">
          <Link 
            to="/dashboard" 
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
              getNavCls({ isActive: currentPath === "/dashboard" })
            )}
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>


          <Link 
            to="/dashboard/jumps" 
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
              getNavCls({ isActive: currentPath === "/dashboard/jumps" })
            )}
          >
            <FileText className="h-4 w-4" />
            My Jumps
          </Link>

          <Link 
            to="/dashboard/tools-prompts" 
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
              getNavCls({ isActive: currentPath === "/dashboard/tools-prompts" })
            )}
          >
            <Sparkles className="h-4 w-4" />
            Tools & Prompts
          </Link>

          <Separator className="my-1.5" />

          {/* Settings */}
          <Link 
            to="/dashboard/settings" 
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
              getNavCls({ isActive: currentPath === "/dashboard/settings" })
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>

          {/* Subscription */}
          <Link 
            to="/dashboard/subscription" 
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
              getNavCls({ isActive: currentPath === "/dashboard/subscription" })
            )}
          >
            <CreditCard className="h-4 w-4" />
            Subscription
          </Link>
        </nav>
      </SidebarContent>
    </Sidebar>
  );
}