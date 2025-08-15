import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/dashboard/AppSidebar";
import DashboardHome from "./dashboard/DashboardHome";
import MyJumps from "./dashboard/MyJumps";
import Prompts from "./dashboard/Prompts";
import Workflows from "./dashboard/Workflows";
import Blueprints from "./dashboard/Blueprints";
import Strategies from "./dashboard/Strategies";
import AccountProfile from "./dashboard/AccountProfile";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate("/auth", { replace: true });
      } else {
        // Get user's name from metadata
        if (session.user.user_metadata?.display_name) {
          setUserName(session.user.user_metadata.display_name);
        }
      }
    });
    
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session?.user) {
        navigate("/auth", { replace: true });
      } else {
        // Get user's name from metadata for existing session
        if (data.session.user.user_metadata?.display_name) {
          setUserName(data.session.user.user_metadata.display_name);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <>
      <Helmet>
        <title>Dashboard | JumpinAI</title>
        <meta name="description" content="Your JumpinAI dashboard: Jumps, Prompts, Workflows, Blueprints, Strategies, and Profile." />
        <link rel="canonical" href={`${window.location.origin}/dashboard`} />
      </Helmet>
      <Navigation />

      <SidebarProvider>
        <div className="min-h-screen flex w-full pt-20">
          <AppSidebar />

          <main className="flex-1">
            <header className="h-14 flex items-center justify-between border-b px-4">
              <div className="flex items-center">
                <SidebarTrigger className="mr-2" />
                <h1 className="text-lg font-semibold">My Dashboard</h1>
              </div>
              {userName && (
                <div className="text-sm text-muted-foreground">
                  Welcome, <span className="text-foreground font-medium">{userName}</span>!
                </div>
              )}
            </header>

            <div className="p-4 md:p-6">
              <Routes>
                <Route index element={<DashboardHome />} />
                <Route path="jumps" element={<MyJumps />} />
                <Route path="prompts" element={<Prompts />} />
                <Route path="workflows" element={<Workflows />} />
                <Route path="blueprints" element={<Blueprints />} />
                <Route path="strategies" element={<Strategies />} />
                <Route path="profile" element={<AccountProfile />} />
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
