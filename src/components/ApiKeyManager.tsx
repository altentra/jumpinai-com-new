
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Key, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiKeyManagerProps {
  onApiKeyChange: (apiKey: string) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onApiKeyChange }) => {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedApiKey = localStorage.getItem("resend_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
      onApiKeyChange(savedApiKey);
    }
  }, [onApiKeyChange]);

  const handleSaveApiKey = () => {
    if (!apiKey.startsWith("re_")) {
      toast({
        title: "Invalid API Key",
        description: "Resend API keys should start with 're_'",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("resend_api_key", apiKey);
    onApiKeyChange(apiKey);
    toast({
      title: "API Key Saved",
      description: "Your Resend API key has been saved securely in your browser.",
    });
  };

  const handleRemoveApiKey = () => {
    localStorage.removeItem("resend_api_key");
    setApiKey("");
    onApiKeyChange("");
    toast({
      title: "API Key Removed",
      description: "Your Resend API key has been removed.",
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Resend API Configuration
        </CardTitle>
        <CardDescription>
          Enter your Resend API key to enable email functionality. Your key will be stored securely in your browser.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey">Resend API Key</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxx"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button onClick={handleSaveApiKey} disabled={!apiKey}>
              Save
            </Button>
            {apiKey && (
              <Button variant="outline" onClick={handleRemoveApiKey}>
                Remove
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-700 dark:text-amber-300">
            <p className="font-medium">Security Note:</p>
            <p>For production use, consider connecting to Supabase to store API keys securely on the server side.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeyManager;
