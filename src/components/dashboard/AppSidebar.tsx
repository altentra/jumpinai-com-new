import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Rocket, Sparkles, GitBranch, Boxes, Lightbulb, User } from "lucide-react";
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
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar className={isCollapsed ? "w-14 top-20 bottom-24" : "w-64 top-20 bottom-24"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
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

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="justify-start">
              <NavLink to="/dashboard/profile" className={getNavCls}>
                <User className="mr-2 h-4 w-4" />
                {!isCollapsed && <span>Profile</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
