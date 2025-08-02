import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Download, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { requestInvestmentDeck } from "@/services/investorService";

interface InvestmentDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InvestmentDeckModal = ({ isOpen, onClose }: InvestmentDeckModalProps) => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    company: "",
    title: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.name) {
      toast({
        title: "Missing Information",
        description: "Please provide your email and name.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await requestInvestmentDeck(formData);
      setIsSuccess(true);
      toast({
        title: "Investment Deck Requested",
        description: "Check your email for the download link.",
      });
    } catch (error: any) {
      console.error("Error requesting investment deck:", error);
      toast({
        title: "Request Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setFormData({ email: "", name: "", company: "", title: "" });
    setIsSuccess(false);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Investment Deck Access
          </DialogTitle>
          <DialogDescription>
            Please provide your professional details to access our investment deck.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-6 text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Email Sent!</h3>
              <p className="text-muted-foreground">
                Check your email for the secure download link to our investment deck.
              </p>
            </div>
            <Button onClick={resetModal} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Your company"
                />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Your title"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={resetModal} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Get Deck
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};