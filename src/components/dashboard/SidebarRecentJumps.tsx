import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentJump {
  id: string;
  title: string;
  created_at: string;
}

export default function SidebarRecentJumps() {
  const [jumps, setJumps] = useState<RecentJump[]>([]);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { pathname } = useLocation();

  // Memoized fetch function to avoid stale closure issues
  const fetchJumps = useCallback(async () => {
    if (!user?.id) return;
    
    console.log('[SidebarRecentJumps] Fetching jumps for user:', user.id);
    
    const { data, error } = await supabase
      .from("user_jumps")
      .select("id, title, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      console.log('[SidebarRecentJumps] Fetched', data.length, 'jumps');
      setJumps(data);
    } else if (error) {
      console.error('[SidebarRecentJumps] Error fetching jumps:', error);
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchJumps();
  }, [fetchJumps]);

  // Real-time subscription for new jumps
  useEffect(() => {
    if (!user?.id) return;

    console.log('[SidebarRecentJumps] Setting up realtime subscription for user:', user.id);

    const channel = supabase
      .channel(`sidebar-jumps-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_jumps',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('[SidebarRecentJumps] Realtime event received:', payload.eventType);
          // Refetch all jumps to ensure correct order
          fetchJumps();
        }
      )
      .subscribe((status) => {
        console.log('[SidebarRecentJumps] Subscription status:', status);
      });

    return () => {
      console.log('[SidebarRecentJumps] Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchJumps]);

  // Check if content overflows and update scroll indicator
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkOverflow = () => {
      const hasOverflow = container.scrollHeight > container.clientHeight;
      const atBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 5;
      setShowScrollIndicator(hasOverflow && !atBottom);
      setIsAtBottom(atBottom);
    };

    checkOverflow();
    container.addEventListener('scroll', checkOverflow);
    
    // Recheck on jumps change
    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', checkOverflow);
      resizeObserver.disconnect();
    };
  }, [jumps]);

  const scrollDown = () => {
    containerRef.current?.scrollBy({ top: 100, behavior: 'smooth' });
  };

  // Calculate jump number (reverse order since sorted by newest first)
  const getJumpNumber = (index: number) => jumps.length - index;

  if (jumps.length === 0) {
    return (
      <div className="px-3 py-2 text-center">
        <p className="text-[11px] text-muted-foreground italic">No jumps yet</p>
      </div>
    );
  }

  return (
    <div className="relative flex-1 min-h-0">
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto px-3 py-2 space-y-0.5 scrollbar-thin scrollbar-thumb-muted/20"
      >
        {jumps.map((jump, index) => {
          const jumpNumber = getJumpNumber(index);
          const isActive = pathname === `/dashboard/jump/${jump.id}`;
          
          return (
            <Link
              key={jump.id}
              to={`/dashboard/jump/${jump.id}`}
              className={cn(
                "block px-2 py-1 rounded text-[11px] transition-all duration-200 truncate",
                isActive
                  ? "bg-primary/10 text-foreground font-medium" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              )}
              title={jump.title}
            >
              {jump.title}
            </Link>
          );
        })}
      </div>

      {/* Fade overlay with scroll indicator */}
      {showScrollIndicator && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-sidebar to-transparent pointer-events-none flex items-end justify-center pb-1"
        >
          <button
            onClick={scrollDown}
            className="pointer-events-auto p-0.5 rounded-full bg-muted/50 hover:bg-muted transition-colors"
          >
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}
