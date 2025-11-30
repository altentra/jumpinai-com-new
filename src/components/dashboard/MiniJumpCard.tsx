import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, Globe, Link2, Copy } from "lucide-react";
import { UserJump } from "@/services/jumpService";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

interface MiniJumpCardProps {
  jump: UserJump;
  onClick: (jump: UserJump) => void;
  isSelected?: boolean;
  onTogglePublic?: (jumpId: string, isPublic: boolean) => Promise<void>;
}

export default function MiniJumpCard({ jump, onClick, isSelected, onTogglePublic }: MiniJumpCardProps) {
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd');
  };

  const handleTogglePublic = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (!onTogglePublic) return;
    
    setIsTogglingPublic(true);
    try {
      await onTogglePublic(jump.id, !jump.is_public);
      toast.success(jump.is_public ? "Jump is now private" : "Jump is now public");
    } catch (error) {
      console.error('Error toggling jump visibility:', error);
      toast.error("Failed to update jump visibility");
    } finally {
      setIsTogglingPublic(false);
    }
  };

  const copyPublicUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/jump/${jump.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Public URL copied to clipboard");
  };

  const publicUrl = `${window.location.origin}/jump/${jump.id}`;

  return (
    <Card 
      className={`w-64 flex-shrink-0 cursor-pointer hover:shadow-md transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-primary border-primary bg-primary/5' 
          : 'border-border/50 hover:border-border'
      }`}
      onClick={() => onClick(jump)}
    >
      <CardHeader className="pb-2 p-4">
        <div className="space-y-2">
          <CardTitle className="text-sm line-clamp-2 leading-tight">
            {jump.title}
          </CardTitle>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(jump.created_at)}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 space-y-3">
        {/* Public/Private Toggle */}
        <div 
          className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/30"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
            <Label htmlFor={`toggle-${jump.id}`} className="text-xs cursor-pointer">
              {jump.is_public ? 'Public' : 'Private'}
            </Label>
          </div>
          <Switch
            id={`toggle-${jump.id}`}
            checked={jump.is_public || false}
            onCheckedChange={(checked) => {
              if (onTogglePublic) {
                onTogglePublic(jump.id, checked);
              }
            }}
            disabled={isTogglingPublic}
            className="scale-75"
          />
        </div>

        {/* Public URL Display */}
        {jump.is_public && (
          <div 
            className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20"
            onClick={(e) => e.stopPropagation()}
          >
            <Link2 className="h-3 w-3 text-primary flex-shrink-0" />
            <span className="text-xs text-primary truncate flex-1" title={publicUrl}>
              /jump/{jump.id.slice(0, 8)}...
            </span>
            <button
              onClick={copyPublicUrl}
              className="p-1 hover:bg-primary/10 rounded transition-colors"
              title="Copy public URL"
            >
              <Copy className="h-3 w-3 text-primary" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}