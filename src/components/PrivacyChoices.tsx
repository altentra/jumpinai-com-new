import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Shield, Cookie, Mail, ChartBar, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface PrivacyChoicesProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyChoices = ({ isOpen, onClose }: PrivacyChoicesProps) => {
  const [preferences, setPreferences] = useState({
    analytics: true,
    marketing: false,
    necessary: true, // Always true, cannot be disabled
    personalization: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSavePreferences = async () => {
    setIsSaving(true);
    
    // Save preferences to localStorage
    localStorage.setItem('privacy-preferences', JSON.stringify({
      ...preferences,
      timestamp: Date.now(),
      version: '1.0'
    }));

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsSaving(false);
    toast.success("Privacy preferences saved successfully");
    onClose();
  };

  const handleToggle = (key: keyof typeof preferences) => {
    if (key === 'necessary') return; // Cannot disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Your Privacy Choices
          </DialogTitle>
          <DialogDescription>
            Manage your privacy preferences and control how your data is used. You can change these settings at any time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Necessary Cookies */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <Label className="flex items-center gap-2 text-base font-medium">
                  <Cookie className="h-4 w-4" />
                  Necessary Cookies
                </Label>
                <p className="text-sm text-muted-foreground">
                  These cookies are essential for the website to function properly. They enable core functionality such as security, network management, and accessibility.
                </p>
                <div className="text-xs text-muted-foreground">
                  Examples: Authentication, security, basic functionality
                </div>
              </div>
              <div className="ml-4">
                <Switch 
                  checked={preferences.necessary} 
                  disabled={true}
                  aria-label="Necessary cookies (always enabled)"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Analytics Cookies */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <Label className="flex items-center gap-2 text-base font-medium">
                  <ChartBar className="h-4 w-4" />
                  Analytics & Performance
                </Label>
                <p className="text-sm text-muted-foreground">
                  These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                </p>
                <div className="text-xs text-muted-foreground">
                  Examples: Page views, user behavior, performance metrics
                </div>
              </div>
              <div className="ml-4">
                <Switch 
                  checked={preferences.analytics} 
                  onCheckedChange={() => handleToggle('analytics')}
                  aria-label="Analytics cookies"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Personalization */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <Label className="flex items-center gap-2 text-base font-medium">
                  <CheckCircle className="h-4 w-4" />
                  Personalization
                </Label>
                <p className="text-sm text-muted-foreground">
                  These cookies allow us to personalize your experience and remember your preferences for future visits.
                </p>
                <div className="text-xs text-muted-foreground">
                  Examples: Theme preferences, language settings, customized content
                </div>
              </div>
              <div className="ml-4">
                <Switch 
                  checked={preferences.personalization} 
                  onCheckedChange={() => handleToggle('personalization')}
                  aria-label="Personalization cookies"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Marketing Cookies */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <Label className="flex items-center gap-2 text-base font-medium">
                  <Mail className="h-4 w-4" />
                  Marketing & Advertising
                </Label>
                <p className="text-sm text-muted-foreground">
                  These cookies are used to make advertising messages more relevant to you and your interests.
                </p>
                <div className="text-xs text-muted-foreground">
                  Examples: Targeted advertising, campaign effectiveness, social media integration
                </div>
              </div>
              <div className="ml-4">
                <Switch 
                  checked={preferences.marketing} 
                  onCheckedChange={() => handleToggle('marketing')}
                  aria-label="Marketing cookies"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Third-Party Services Section */}
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">Third-Party Services We Use</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <strong>Stripe:</strong> Payment processing</li>
              <li>• <strong>Supabase:</strong> Database and authentication</li>
              <li>• <strong>AI Providers:</strong> OpenAI, Anthropic, Google, xAI for content generation</li>
              <li>• <strong>Analytics Services:</strong> Website performance and user behavior tracking</li>
            </ul>
          </div>

          {/* Additional Information */}
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">Important Information</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• We do not sell your personal information to third parties</li>
              <li>• You can change these preferences at any time</li>
              <li>• Some features may not work properly if you disable certain cookies</li>
              <li>• Necessary cookies cannot be disabled as they are essential for site functionality</li>
              <li>• For more details, see our <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={() => {
                setPreferences({
                  analytics: true,
                  marketing: true,
                  necessary: true,
                  personalization: true,
                });
                toast.success("All preferences enabled");
              }}
              variant="outline"
              className="flex-1"
            >
              Accept All
            </Button>
            <Button 
              onClick={() => {
                setPreferences({
                  analytics: false,
                  marketing: false,
                  necessary: true,
                  personalization: false,
                });
                toast.success("Only necessary cookies enabled");
              }}
              variant="outline"
              className="flex-1"
            >
              Reject All
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleSavePreferences}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? "Saving..." : "Save Custom Preferences"}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};