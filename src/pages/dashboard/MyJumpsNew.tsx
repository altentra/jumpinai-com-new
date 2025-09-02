import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Clock } from "lucide-react";

export default function MyJumpsNew() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Rocket className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">My Jumps</h1>
          <p className="text-muted-foreground">Your personal AI jumps collection</p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card className="border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 rounded-full bg-muted w-fit">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Coming Soon!</CardTitle>
          <CardDescription className="text-lg">
            We're working hard to bring you an amazing new experience for managing your personal AI jumps.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            This feature is currently under development and will be available soon. 
            Stay tuned for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}