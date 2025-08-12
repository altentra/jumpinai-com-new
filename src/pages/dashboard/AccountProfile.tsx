import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

export default function AccountProfile() {
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return;
      const { data } = await (supabase.from("profiles" as any) as any)
        .select("display_name, avatar_url")
        .eq("id", userId)
        .maybeSingle();
      setDisplayName((data as any)?.display_name ?? "");
      setAvatarUrl((data as any)?.avatar_url ?? "");
    })();
  }, []);

  const save = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;
    const { error } = await (supabase.from("profiles" as any) as any)
      .upsert({ id: userId, display_name: displayName, avatar_url: avatarUrl });
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="display_name">Display name</Label>
          <Input id="display_name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="avatar_url">Avatar URL</Label>
          <Input id="avatar_url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={save}>Save changes</Button>
      </CardFooter>
    </Card>
  );
}
