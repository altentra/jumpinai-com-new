import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) navigate("/auth", { replace: true });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session?.user) navigate("/auth", { replace: true });
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
        <div className="min-h-screen flex w-full pt-28 pb-24">
          <AppSidebar />

          <main className="flex-1">
            <header className="h-14 flex items-center border-b px-4">
              <SidebarTrigger className="mr-2" />
              <h1 className="text-lg font-semibold">My Dashboard</h1>
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

      <Footer />
    </>
  );
}
