import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar } from "lucide-react";
import { UserJump } from "@/services/jumpService";
import { format } from "date-fns";
import { generateJumpPDF } from '@/utils/pdfGenerator';
import UnifiedJumpDisplay from './UnifiedJumpDisplay';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface JumpDetailModalProps {
  jump: UserJump | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function JumpDetailModal({ jump, isOpen, onClose }: JumpDetailModalProps) {
  const [components, setComponents] = useState<any>({});
  const [loading, setLoading] = useState(false);

  if (!jump) return null;

  // Load jump components when modal opens
  useEffect(() => {
    if (isOpen && jump) {
      loadJumpComponents();
    }
  }, [isOpen, jump?.id]);

  const loadJumpComponents = async () => {
    if (!jump) return;
    
    setLoading(true);
    try {
      const [promptsRes, workflowsRes, blueprintsRes, strategiesRes] = await Promise.all([
        supabase.from('user_prompts').select('*').eq('jump_id', jump.id),
        supabase.from('user_workflows').select('*').eq('jump_id', jump.id),
        supabase.from('user_blueprints').select('*').eq('jump_id', jump.id),
        supabase.from('user_strategies').select('*').eq('jump_id', jump.id)
      ]);

      setComponents({
        prompts: promptsRes.data || [],
        workflows: workflowsRes.data || [],
        blueprints: blueprintsRes.data || [],
        strategies: strategiesRes.data || [],
        tools: [] // Tools are usually embedded in the content, not stored separately
      });
    } catch (error) {
      console.error('Error loading jump components:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy \'at\' HH:mm');
  };

  const downloadPlan = () => {
    generateJumpPDF({
      title: jump.title,
      summary: jump.summary,
      content: jump.full_content,
      createdAt: jump.created_at
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-card/95 to-primary/5 border border-primary/20 shadow-2xl shadow-primary/10 backdrop-blur-xl rounded-3xl">
        <DialogHeader className="pb-4 border-b border-primary/20">
          <DialogDescription className="sr-only">Detailed view of your AI-generated Jump plan with download option.</DialogDescription>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl mb-2 line-clamp-2">
                {jump.title}
              </DialogTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Created {formatDate(jump.created_at)}</span>
                </div>
                <Badge variant="secondary">
                  AI Generated
                </Badge>
              </div>
            </div>
            <Button 
              onClick={downloadPlan}
              variant="outline"
              size="sm"
              className="gap-2 rounded-2xl border-primary/30 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 hover:scale-105"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 animate-enter">
          <ErrorBoundary
            fallback={
              <div className="p-6 border border-destructive/30 rounded-lg bg-destructive/5 text-center">
                <h3 className="text-lg font-semibold mb-2">We hit a snag rendering this jump</h3>
                <p className="text-sm text-muted-foreground mb-4">Open it in JumpinAI Studio or try again.</p>
                <Button variant="outline" size="sm" onClick={() => (window.location.href = '/jumpinai-studio')}>Open in JumpinAI Studio</Button>
              </div>
            }
          >
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <UnifiedJumpDisplay
                jump={jump}
                components={components}
              />
            )}
          </ErrorBoundary>
        </div>
      </DialogContent>
    </Dialog>
  );
}