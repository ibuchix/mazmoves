import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { Tables } from "@/types/database";

// Define an interface for the extended move request data
type MoveRequestRow = Tables["move_requests"]["Row"];
interface ExtendedMoveRequest extends MoveRequestRow {
  distance?: number;
  location_used?: 'pickup' | 'delivery';
}

export function useRealtimeAssignments() {
  const { session } = useAuth();

  useEffect(() => {
    if (!session?.user) return;

    // Only subscribe to assignments if the company is verified
    const checkVerification = async () => {
      const { data: company } = await supabase
        .from('companies')
        .select('is_verified')
        .eq('contact_email', session.user.email)
        .single();

      if (!company?.is_verified) {
        return;
      }

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

              // Cast the move request to our extended type
              const extendedMoveRequest = moveRequest as ExtendedMoveRequest;
              
              // Format the distance message
              const distance = Math.round(extendedMoveRequest.distance || 0);
              const locationText = extendedMoveRequest.location_used === 'pickup' ? 'pickup location' : 'delivery location';

              // Use toast from sonner which accepts description directly
              toast(`You have been assigned a new moving request ${distance} miles away from your ${locationText}.`);

              console.log('New assignment received:', {
                assignmentId: payload.new.id,
                requestId: payload.new.request_id,
                distance,
                locationUsed: extendedMoveRequest.location_used
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
    };

    checkVerification();
  }, [session?.user]);
}