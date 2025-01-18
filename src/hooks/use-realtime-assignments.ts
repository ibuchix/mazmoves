import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

export function useRealtimeAssignments() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!session?.user?.email) return;

    // Subscribe to assignment changes
    const channel = supabase
      .channel('assignments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'move_assignments',
          filter: `company_id=in.(select id from companies where contact_email='${session.user.email}')`
        },
        async (payload) => {
          console.log('Assignment change received:', payload);

          // Show notification for new assignments
          if (payload.eventType === 'INSERT') {
            toast.info("New move assignment available!", {
              description: "Check your dashboard for details",
              duration: 5000,
            });
          }

          // Invalidate and refetch assignments
          await queryClient.invalidateQueries({ queryKey: ["assignments"] });
          await queryClient.invalidateQueries({ queryKey: ["stats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.email, queryClient]);
}