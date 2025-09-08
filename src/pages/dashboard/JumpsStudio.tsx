import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Sparkles, Zap } from "lucide-react";

export default function JumpsStudio() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Palette className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Jumps Studio</h1>
          <p className="text-muted-foreground">Create and customize your AI jumps</p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card className="border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 w-fit">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Studio Mode Coming Soon!</CardTitle>
          <CardDescription className="text-lg">
            Design, customize, and fine-tune your AI jumps with our powerful studio interface.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="grid md:grid-cols-3 gap-4 text-left">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Visual Editor</h4>
                <p className="text-sm text-muted-foreground">Drag-and-drop interface for jump creation</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Palette className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Custom Themes</h4>
                <p className="text-sm text-muted-foreground">Personalize your jumps with custom styling</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium">AI Templates</h4>
                <p className="text-sm text-muted-foreground">Smart templates to accelerate your workflow</p>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground mt-6">
            This powerful creative workspace is currently in development. 
            Get ready to unleash your creativity with advanced jump customization tools!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}