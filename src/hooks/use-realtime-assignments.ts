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
        async (payload) => {
          try {
            // Call the Edge Function to check distance
            const response = await supabase.functions.invoke('check-move-distance', {
              body: { record: payload.new }
            });

            if (response.error) {
              console.error('Distance check failed:', response.error);
              return;
            }

            // Only show notification if the assignment wasn't deleted (i.e., was within range)
            if (!response.data?.message?.includes('deleted')) {
              const distance = Math.round(response.data?.distance || 0);
              toast({
                title: "New Move Assignment",
                description: `You have been assigned a new moving request ${distance} miles away.`,
              });
              console.log('New assignment:', payload);
            }
          } catch (error) {
            console.error('Error checking distance:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user]);
}