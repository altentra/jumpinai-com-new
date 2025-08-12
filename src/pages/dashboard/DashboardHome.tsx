import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Crown, Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function DashboardHome() {
  const subscribe = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      const url = (data as any)?.url;
      if (url) window.open(url, "_blank");
    } catch (e: any) {
      toast.error(e.message || "Failed to start checkout");
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" /> Welcome to JumpinAI
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Explore your Jumps, Prompts, Workflows, Blueprints and Strategies from the sidebar.
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" /> Upgrade to JumpinAI Pro
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Get all digital products with ongoing updates for just $10/month.
        </CardContent>
        <CardFooter>
          <Button onClick={subscribe}>Get Pro</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
