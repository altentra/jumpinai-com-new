import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, Trash2 } from "lucide-react";
import { UserJump } from "@/services/jumpService";
import { format } from "date-fns";

interface JumpCardProps {
  jump: UserJump;
  onView: (jump: UserJump) => void;
  onDelete: (jumpId: string) => void;
}

export default function JumpCard({ jump, onView, onDelete }: JumpCardProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  return (
    <Card className="bg-gradient-to-br from-card/95 to-primary/5 border border-primary/20 rounded-3xl shadow-2xl shadow-primary/10 backdrop-blur-xl hover:shadow-primary/20 hover:border-primary/30 transition-all duration-300 hover-scale">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2 mb-2">
              {jump.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDate(jump.created_at)}</span>
            </div>
          </div>
          <Badge variant="secondary">
            AI Generated
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {jump.summary && (
          <CardDescription className="line-clamp-3 mb-4">
            {jump.summary}
          </CardDescription>
        )}
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => onView(jump)}
            variant="default"
            size="sm"
            className="flex-1 rounded-2xl shadow-md hover:shadow-lg"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Full Plan
          </Button>
          
          <Button
            onClick={() => onDelete(jump.id)}
            variant="outline"
            size="sm"
            className="rounded-2xl border-primary/30 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}