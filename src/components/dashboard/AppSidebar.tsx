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
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Home, FileText, CreditCard, Zap, Rocket, ChevronLeft, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth0Token } from "@/hooks/useAuth0Token";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import logoTransparent from "@/assets/logo-transparent.png";
import SidebarRecentJumps from "./SidebarRecentJumps";

interface SubscriberInfo {
  subscribed: boolean;
  subscription_tier?: string | null;
  subscription_end?: string | null;
}

export default function AppSidebar() {
  const { isMobile, setOpenMobile, state, toggleSidebar, openMobile } = useSidebar();
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
      setUserName(user?.display_name || user?.email?.split('@')[0] || "");
      refreshSubscription();
    }

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

  const isCollapsed = state === "collapsed";

  // Desktop toggle button - appears at sidebar edge or floats when collapsed
  const DesktopToggleButton = () => (
    <button
      onClick={toggleSidebar}
      className={cn(
        "fixed z-50 hidden md:flex",
        "w-8 h-8 rounded-full",
        "bg-background/95 backdrop-blur-xl border border-border/50",
        "shadow-lg shadow-black/10 dark:shadow-black/30",
        "items-center justify-center",
        "text-muted-foreground hover:text-foreground",
        "hover:bg-primary/10 hover:border-primary/30",
        "transition-all duration-300 ease-out",
        "hover:scale-110 active:scale-95",
        // Position: when expanded, at sidebar edge; when collapsed, near left edge
        isCollapsed 
          ? "top-20 left-2" 
          : "top-20 left-[13.25rem]"
      )}
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      <ChevronLeft 
        className={cn(
          "w-4 h-4 transition-transform duration-300",
          isCollapsed && "rotate-180"
        )} 
      />
    </button>
  );

  // Mobile toggle button - always visible on mobile, above sheet overlay
  const MobileToggleButton = () => (
    <button
      onClick={() => setOpenMobile(!openMobile)}
      className={cn(
        "fixed flex md:hidden",
        // z-[60] to be above Sheet overlay (z-50)
        "z-[60]",
        "w-10 h-10 rounded-full",
        "bg-background/95 backdrop-blur-xl border border-border/50",
        "shadow-lg shadow-black/10 dark:shadow-black/30",
        "items-center justify-center",
        "text-muted-foreground hover:text-foreground",
        "hover:bg-primary/10 hover:border-primary/30",
        "transition-all duration-300 ease-out",
        "active:scale-95",
        // When sidebar is open, position button centered on the sidebar edge
        openMobile 
          ? "top-[5.5rem] left-[calc(18rem-1.25rem)]" 
          : "top-[5.5rem] left-3"
      )}
      aria-label={openMobile ? "Close sidebar" : "Open sidebar"}
    >
      {openMobile ? (
        <ChevronLeft className="w-5 h-5" />
      ) : (
        <ChevronRight className="w-5 h-5" />
      )}
    </button>
  );

  return (
    <>
      <DesktopToggleButton />
      <MobileToggleButton />
      <Sidebar className="mt-20 md:mt-16 h-[calc(100vh-5rem)] md:h-[calc(100vh-4rem)] flex flex-col">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-2 pt-3 shrink-0">
        <Link 
          to="/dashboard/profile" 
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg px-2 py-1.5 transition-all duration-300",
            "hover:bg-gradient-to-br hover:from-primary/10 hover:via-accent/5 hover:to-primary/10 hover:backdrop-blur-xl hover:border hover:border-primary/20",
            currentPath === "/dashboard/profile" 
              ? "bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl border border-primary/20" 
              : "border border-transparent"
          )}
        >
          <Avatar className="h-7 w-7">
            {user?.avatar_url ? (
              <AvatarImage src={user.avatar_url} alt={userName} />
            ) : (
              <div className="relative h-full w-full flex items-center justify-center bg-background">
                <img 
                  src={logoTransparent} 
                  alt="JumpinAI" 
                  className="h-5 w-5 opacity-40 brightness-200"
                />
              </div>
            )}
            <AvatarFallback className="text-xs">
              {userName?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="text-[13px] font-medium text-foreground">{userName || 'User'}</span>
        </Link>
        <div className="flex items-center justify-center gap-2 mt-1">
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] px-1.5 py-0",
              subInfo?.subscribed ? "border-primary/20 text-primary" : "border-muted text-muted-foreground"
            )}
          >
            {subInfo?.subscribed ? subInfo.subscription_tier || 'Free' : 'Free'}
          </Badge>
          <div className="flex items-center gap-1 text-[11px]">
            <Zap className="w-3 h-3 text-primary" />
            <span className="font-semibold text-foreground">{creditsBalance}</span>
            <span className="text-muted-foreground">credits</span>
          </div>
        </div>
        
        <Link 
          to="/dashboard/subscription" 
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-all duration-300 mt-2",
            getNavCls({ isActive: currentPath === "/dashboard/subscription" })
          )}
        >
          <CreditCard className="h-4 w-4" />
          Subscription & Credits
        </Link>
      </SidebarHeader>

      {/* Navigation Links - Fixed section */}
      <nav className="p-3 space-y-1 shrink-0">
        <Link 
          to="/dashboard" 
          className={cn(
            "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-all duration-300",
            getNavCls({ isActive: currentPath === "/dashboard" })
          )}
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Link>

        <Link 
          to="/dashboard/studio" 
          className={cn(
            "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-all duration-300",
            getNavCls({ isActive: currentPath === "/dashboard/studio" })
          )}
        >
          <Rocket className="h-4 w-4" />
          JumpinAI Studio
        </Link>

        <Link 
          to="/dashboard/jumps" 
          className={cn(
            "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-all duration-300",
            getNavCls({ isActive: currentPath === "/dashboard/jumps" })
          )}
        >
          <FileText className="h-4 w-4" />
          My Jumps
        </Link>

        <Separator className="my-1" />
      </nav>

      {/* Recent Jumps - Flexible scrollable area */}
      <SidebarContent className="flex-1 min-h-0 overflow-hidden">
        <SidebarRecentJumps />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3 shrink-0">
        <Link 
          to="/dashboard/settings" 
          className={cn(
            "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-all duration-300",
            getNavCls({ isActive: currentPath === "/dashboard/settings" })
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </SidebarFooter>
    </Sidebar>
    </>
  );
}
