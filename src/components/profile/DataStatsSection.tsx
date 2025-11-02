import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Database, Trash2, AlertTriangle, TrendingUp, TrendingDown, Coins, HardDrive } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface DataStats {
  totalJumps: number;
  totalToolPrompts: number;
  storageBytes: number;
  creditsUsed: number;
  creditsAcquired: number;
  currentBalance: number;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 KB";
  
  const k = 1024;
  const mb = bytes / (k * k);
  
  if (mb >= 1) {
    return `${mb.toFixed(2)} MB`;
  } else {
    const kb = bytes / k;
    return `${kb.toFixed(2)} KB`;
  }
};

export default function DataStatsSection() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DataStats>({
    totalJumps: 0,
    totalToolPrompts: 0,
    storageBytes: 0,
    creditsUsed: 0,
    creditsAcquired: 0,
    currentBalance: 0
  });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchDataStats();
    }
  }, [user?.id]);

  const fetchDataStats = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Fetch jumps count and calculate storage
      const { data: jumps, error: jumpsError } = await supabase
        .from("user_jumps")
        .select("full_content, title, summary, structured_plan, comprehensive_plan")
        .eq("user_id", user.id);

      if (jumpsError) throw jumpsError;

      // Fetch tool prompts count and calculate storage
      const { data: toolPrompts, error: toolPromptsError } = await supabase
        .from("user_tool_prompts")
        .select("prompt_text, title, description, content")
        .eq("user_id", user.id);

      if (toolPromptsError) throw toolPromptsError;

      // Calculate total storage (estimate in bytes)
      let totalStorage = 0;
      
      jumps?.forEach((jump) => {
        totalStorage += new Blob([jump.full_content || ""]).size;
        totalStorage += new Blob([jump.title || ""]).size;
        totalStorage += new Blob([jump.summary || ""]).size;
        totalStorage += new Blob([JSON.stringify(jump.structured_plan || {})]).size;
        totalStorage += new Blob([JSON.stringify(jump.comprehensive_plan || {})]).size;
      });

      toolPrompts?.forEach((prompt) => {
        totalStorage += new Blob([prompt.prompt_text || ""]).size;
        totalStorage += new Blob([prompt.title || ""]).size;
        totalStorage += new Blob([prompt.description || ""]).size;
        totalStorage += new Blob([JSON.stringify(prompt.content || {})]).size;
      });

      // Fetch credit statistics
      const { data: creditTransactions, error: creditsError } = await supabase
        .from("credit_transactions")
        .select("transaction_type, credits_amount")
        .eq("user_id", user.id);

      if (creditsError) throw creditsError;

      let creditsUsed = 0;
      let creditsAcquired = 0;

      creditTransactions?.forEach((transaction) => {
        if (transaction.credits_amount < 0) {
          creditsUsed += Math.abs(transaction.credits_amount);
        } else {
          creditsAcquired += transaction.credits_amount;
        }
      });

      // Fetch current credit balance
      const { data: userCredits, error: balanceError } = await supabase
        .from("user_credits")
        .select("credits_balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (balanceError) throw balanceError;

      setStats({
        totalJumps: jumps?.length || 0,
        totalToolPrompts: toolPrompts?.length || 0,
        storageBytes: totalStorage,
        creditsUsed,
        creditsAcquired,
        currentBalance: userCredits?.credits_balance || 0
      });
    } catch (error) {
      console.error("Error fetching data stats:", error);
      toast.error("Failed to load data statistics");
    } finally {
      setLoading(false);
    }
  };

  const deleteAllGeneratedData = async () => {
    if (confirmText !== "DELETE ALL") {
      toast.error("Please type 'DELETE ALL' exactly as shown to confirm");
      return;
    }

    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    setDeleting(true);
    try {
      // Delete all user jumps
      const { error: jumpsError } = await supabase
        .from("user_jumps")
        .delete()
        .eq("user_id", user.id);

      if (jumpsError) throw jumpsError;

      // Delete all user tool prompts
      const { error: toolPromptsError } = await supabase
        .from("user_tool_prompts")
        .delete()
        .eq("user_id", user.id);

      if (toolPromptsError) throw toolPromptsError;

      toast.success("All generated data has been deleted successfully");
      setConfirmText("");
      
      // Refresh stats
      await fetchDataStats();
    } catch (error: any) {
      console.error("Error deleting generated data:", error);
      toast.error(error.message || "Failed to delete generated data");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Database className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            Data Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading statistics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Database className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
          Data Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Generated Content Stats */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-primary" />
            Generated Content
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 sm:p-4 bg-muted/50 rounded-lg border space-y-1">
              <p className="text-xs text-muted-foreground">Total Jumps</p>
              <p className="text-2xl font-bold">{stats.totalJumps}</p>
            </div>
            <div className="p-3 sm:p-4 bg-muted/50 rounded-lg border space-y-1">
              <p className="text-xs text-muted-foreground">Tools & Prompts</p>
              <p className="text-2xl font-bold">{stats.totalToolPrompts}</p>
            </div>
          </div>
          <div className="p-3 sm:p-4 bg-muted/50 rounded-lg border space-y-1">
            <p className="text-xs text-muted-foreground">Storage Used</p>
            <p className="text-2xl font-bold">{formatBytes(stats.storageBytes)}</p>
          </div>
        </div>

        <Separator />

        {/* Credits Statistics */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Coins className="h-4 w-4 text-primary" />
            Credits Lifetime Statistics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 sm:p-4 bg-muted/50 rounded-lg border space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Credits Acquired
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-500">
                {stats.creditsAcquired}
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-muted/50 rounded-lg border space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                Credits Used
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-500">
                {stats.creditsUsed}
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-primary/10 rounded-lg border border-primary/20 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Coins className="h-3 w-3" />
                Current Balance
              </p>
              <p className="text-2xl font-bold text-primary">
                {stats.currentBalance}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Delete All Data Action */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </h3>
          <div className="p-3 sm:p-4 bg-destructive/5 rounded-lg border border-destructive/20">
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              Permanently delete all your generated jumps and tool prompts. This action cannot be undone. Your credits and account will remain intact.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full sm:w-auto"
                  disabled={stats.totalJumps === 0 && stats.totalToolPrompts === 0}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete All Generated Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="w-[95vw] max-w-md mx-auto">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-destructive text-lg">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <span className="text-base sm:text-lg">Delete All Generated Data</span>
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3 sm:space-y-4">
                    <div className="text-sm leading-relaxed">
                      <strong>This action cannot be undone.</strong> You are about to delete:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      <li><strong>{stats.totalJumps}</strong> Jumps ({formatBytes(stats.storageBytes)} of content)</li>
                      <li><strong>{stats.totalToolPrompts}</strong> Tools & Prompts</li>
                    </ul>
                    <div className="text-sm leading-relaxed text-muted-foreground">
                      Your account, credits, and subscription will remain unchanged. Only your generated content will be deleted.
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="delete-data-confirm" className="text-sm">
                        Type <strong className="font-mono">DELETE ALL</strong> to confirm:
                      </label>
                      <input
                        id="delete-data-confirm"
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Type DELETE ALL here"
                        className="w-full px-3 py-2 text-sm border rounded-md font-mono bg-background"
                      />
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <AlertDialogCancel 
                    onClick={() => setConfirmText("")}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={deleteAllGeneratedData}
                    disabled={confirmText !== "DELETE ALL" || deleting}
                    className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto order-1 sm:order-2"
                  >
                    {deleting ? "Deleting..." : "Delete All Data"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
