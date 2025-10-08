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
import { supabase } from "@/integrations/supabase/client";
import { User, Settings, Home, FileText, Workflow, Lightbulb, Boxes, ChevronDown, CreditCard, Palette } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth0Token } from "@/hooks/useAuth0Token";

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
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar className="w-52 mt-20">
      <SidebarHeader className="border-b border-border px-3 py-2">
        <div className="text-center text-sm text-muted-foreground mb-1">
          Welcome{userName ? (
            <>
              , <span className="font-medium text-foreground">{userName}</span>!
            </>
          ) : "!"}
        </div>
        {subInfo && (
          <div className="flex justify-center">
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs w-fit px-2 py-0.5",
                subInfo.subscribed ? "border-primary/20 text-primary" : "border-muted text-muted-foreground"
              )}
            >
              {subInfo.subscribed ? subInfo.subscription_tier || 'Pro Plan' : 'Free Plan'}
            </Badge>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5">
          <Link 
            to="/dashboard" 
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
              getNavCls({ isActive: currentPath === "/dashboard" })
            )}
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>


          <Link 
            to="/dashboard/jumps" 
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
              getNavCls({ isActive: currentPath === "/dashboard/jumps" })
            )}
          >
            <FileText className="h-4 w-4" />
            My Jumps
          </Link>

          <Separator className="my-1.5" />

          <Link 
            to="/dashboard/tools" 
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
              getNavCls({ isActive: currentPath === "/dashboard/tools" })
            )}
          >
            <Settings className="h-4 w-4" />
            My Tools
          </Link>

          <Link 
            to="/dashboard/prompts" 
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
              getNavCls({ isActive: currentPath === "/dashboard/prompts" })
            )}
          >
            <FileText className="h-4 w-4" />
            My Prompts
          </Link>

          <Link 
            to="/dashboard/workflows" 
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
              getNavCls({ isActive: currentPath === "/dashboard/workflows" })
            )}
          >
            <Workflow className="h-4 w-4" />
            My Workflows
          </Link>

          <Link 
            to="/dashboard/blueprints" 
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
              getNavCls({ isActive: currentPath === "/dashboard/blueprints" })
            )}
          >
            <Boxes className="h-4 w-4" />
            My Blueprints
          </Link>

          <Link 
            to="/dashboard/strategies" 
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
              getNavCls({ isActive: currentPath === "/dashboard/strategies" })
            )}
          >
            <Lightbulb className="h-4 w-4" />
            My Strategies
          </Link>

          <Separator className="my-1.5" />

          {/* Profile & Settings */}
          <Link 
            to="/dashboard/profile" 
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm hover:bg-muted/50 transition-colors",
              getNavCls({ isActive: currentPath === "/dashboard/profile" })
            )}
          >
            <User className="h-4 w-4" />
            Profile
          </Link>

          {/* Subscription */}
          <Link 
            to="/dashboard/subscription" 
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm hover:bg-muted/50 transition-colors",
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