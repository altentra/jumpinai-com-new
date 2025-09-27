import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/dashboard/AppSidebar";
import DashboardHome from "./dashboard/DashboardHome";
import MyJumpsNew from "./dashboard/MyJumpsNew";
import JumpsGuides from "./dashboard/JumpsGuides";
import Tools from "./dashboard/Tools";
import Prompts from "./dashboard/Prompts";
import Workflows from "./dashboard/Workflows";
import Blueprints from "./dashboard/Blueprints";
import Strategies from "./dashboard/Strategies";
import AccountProfile from "./dashboard/AccountProfile";
import Subscription from "./dashboard/Subscription";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");
  const { isAuthenticated, isLoading, user, login } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        login('/dashboard');
      } else if (user) {
        setUserName(user.display_name || user.email || "");
      }
    }
  }, [isAuthenticated, isLoading, user, login]);

  return (
    <>
      <Helmet>
        <title>Dashboard | JumpinAI</title>
        <meta name="description" content="Your JumpinAI dashboard: Jumps, Prompts, Workflows, Blueprints, Strategies, and Profile." />
        <link rel="canonical" href={`${window.location.origin}/dashboard`} />
      </Helmet>
      <Navigation />

      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full pt-20 bg-gradient-to-br from-background via-background/90 to-primary/5 dark:bg-gradient-to-br dark:from-black dark:via-gray-950/90 dark:to-gray-900/60 relative">
          {/* Enhanced floating background elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-primary/5 dark:bg-gradient-to-br dark:from-gray-800/30 dark:to-gray-700/15 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-secondary/15 to-secondary/5 dark:bg-gradient-to-tr dark:from-gray-700/25 dark:to-gray-600/15 rounded-full blur-3xl"></div>
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-accent/10 dark:bg-gradient-radial dark:from-gray-800/20 dark:to-transparent rounded-full blur-2xl"></div>
            <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent dark:bg-gradient-to-br dark:from-gray-700/20 dark:to-transparent rounded-full blur-xl"></div>
            <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-tr from-secondary/8 to-transparent dark:bg-gradient-to-tr dark:from-gray-600/15 dark:to-transparent rounded-full blur-xl"></div>
          </div>
          <AppSidebar />

          <main className="flex-1 relative z-10">
            <header className="h-12 flex items-center justify-between border-b px-3">
              <div className="flex items-center">
                <SidebarTrigger className="mr-2 hover:bg-muted/50 transition-colors rounded-md p-1" />
                <h1 className="text-base font-medium">My Dashboard</h1>
              </div>
            </header>

            <div className="p-4 md:p-6">
              <Routes>
                <Route index element={<DashboardHome />} />
                <Route path="jumps" element={<MyJumpsNew />} />
                
            <Route path="jumps-guides" element={<JumpsGuides />} />
            <Route path="tools" element={<Tools />} />
            <Route path="prompts" element={<Prompts />} />
            <Route path="workflows" element={<Workflows />} />
            <Route path="blueprints" element={<Blueprints />} />
            <Route path="strategies" element={<Strategies />} />
                <Route path="profile" element={<AccountProfile />} />
                <Route path="subscription" element={<Subscription />} />
                <Route path="*" element={<Navigate to="." replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </SidebarProvider>

      <div className="h-12 border-t bg-background flex items-center justify-center text-sm text-muted-foreground">
        © 2025 JumpinAI, LLC. All rights reserved.
      </div>
    </>
  );
}
