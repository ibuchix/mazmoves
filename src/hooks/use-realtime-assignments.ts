import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

export function useRealtimeAssignments() {
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
        async (payload) => {
          try {
            // Get the move request details
            const { data: moveRequest } = await supabase
              .from('move_requests')
              .select('*')
              .eq('id', payload.new.request_id)
              .single();

            if (!moveRequest) {
              console.error('Move request not found');
              return;
            }

            // Format the distance message
            const distance = Math.round(moveRequest.distance || 0);
            const locationText = moveRequest.location_used === 'pickup' ? 'pickup location' : 'delivery location';

            toast({
              title: "New Move Assignment",
              description: `You have been assigned a new moving request ${distance} miles away from your ${locationText}.`,
            });

            console.log('New assignment received:', {
              assignmentId: payload.new.id,
              requestId: payload.new.request_id,
              distance,
              locationUsed: moveRequest.location_used
            });
          } catch (error) {
            console.error('Error processing new assignment:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user]);
}