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
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.display_name) {
        setUserName(user.user_metadata.display_name);
      }
    };
    
    fetchUserProfile();
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
