import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export function useRealtimeAssignments() {
  const { toast } = useToast();
  const { session } = useAuth();

  useEffect(() => {
    if (!session?.user) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'move_assignments',
          filter: `company_id=eq.${session.user.id}`,
        },
        (payload) => {
          toast({
            title: "New Move Assignment",
            description: "You have been assigned a new moving request.",
          });
          console.log('New assignment:', payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user]);
}