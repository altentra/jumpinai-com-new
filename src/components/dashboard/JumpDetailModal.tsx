import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar } from "lucide-react";
import { UserJump } from "@/services/jumpService";
import { format } from "date-fns";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateJumpPDF } from '@/utils/pdfGenerator';
import JumpPlanDisplay from './JumpPlanDisplay';
import ComprehensiveJumpDisplay from './ComprehensiveJumpDisplay';

interface JumpDetailModalProps {
  jump: UserJump | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function JumpDetailModal({ jump, isOpen, onClose }: JumpDetailModalProps) {
  if (!jump) return null;

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b border-border/30">
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
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {jump.comprehensive_plan ? (
            <ComprehensiveJumpDisplay
              jump={jump.comprehensive_plan}
              onEdit={() => {}}
              onDownload={downloadPlan}
            />
          ) : jump.structured_plan ? (
            <JumpPlanDisplay
              planContent={jump.full_content}
              structuredPlan={jump.structured_plan}
              onEdit={() => {}}
              onDownload={downloadPlan}
            />
          ) : (
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border/30">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-foreground leading-relaxed mb-4">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-foreground mb-4 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-foreground mb-4 space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-foreground">
                      {children}
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-foreground">
                      {children}
                    </em>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-4 bg-muted/20 py-2 rounded-r">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4 border border-border/30">
                      <code className="text-sm font-mono text-foreground">
                        {children}
                      </code>
                    </pre>
                  ),
                }}
              >
                {jump.full_content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}