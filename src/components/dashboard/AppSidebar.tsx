import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { LayoutDashboard, Rocket, Sparkles, GitBranch, Boxes, Lightbulb, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Jumps in AI", url: "/dashboard/jumps", icon: Rocket },
  { title: "My Prompts", url: "/dashboard/prompts", icon: Sparkles },
  { title: "My Workflows", url: "/dashboard/workflows", icon: GitBranch },
  { title: "My Blueprints", url: "/dashboard/blueprints", icon: Boxes },
  { title: "My Strategies", url: "/dashboard/strategies", icon: Lightbulb },
];

export default function AppSidebar() {
  const { state, setOpenMobile, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [currentPath, isMobile, setOpenMobile]);

  useEffect(() => {
    const fetchUserProfile = async () => {
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
        console.error('Error fetching user profile:', error);
      }
    };
    
    fetchUserProfile();
    
    // Listen for profile updates
    const handleProfileUpdate = () => {
      fetchUserProfile();
    };
    
    window.addEventListener('profile-updated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, []);

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar className={isCollapsed ? "w-14 top-20 bottom-12" : "w-64 top-20 bottom-12"} collapsible="icon">
      <SidebarContent className="pb-24">
        <SidebarGroup>
          {/* Welcome Message */}
          {!isCollapsed && userName && (
            <div className="px-3 py-3 mb-2 border-b border-border">
              <p className="text-sm font-medium text-foreground">Welcome, {userName}</p>
              <p className="text-xs text-muted-foreground">to JumpinAI!</p>
            </div>
          )}
          
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="justify-start h-10">
                  <NavLink to="/dashboard/profile" end className={(nav) => getNavCls(nav) + " text-base py-3 font-semibold"}>
                    <User className="mr-2 h-4 w-4" />
                    {!isCollapsed && <span>Profile</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="justify-start">
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

    </Sidebar>
  );
}
