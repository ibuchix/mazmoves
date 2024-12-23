import { useEffect, useState } from "react";
import { useRealtimeAssignments } from "@/hooks/use-realtime-assignments";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type MoveAssignmentWithRequest = Database['public']['Tables']['move_assignments']['Row'] & {
  move_requests: {
    pickup_address: {
      street: string;
      city: string;
      state: string;
    }
  }
};

interface MoveAssignment {
  id: string;
  request_id: string;
  status: Database['public']['Enums']['assignment_status'] | null;
  assigned_date: string;
  estimated_cost: number | null;
  pickup_address: {
    street: string;
    city: string;
    state: string;
  };
}

export default function Index() {
  useRealtimeAssignments();
  const [assignments, setAssignments] = useState<MoveAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setIsLoading(true);
        const { data: assignmentsData, error } = await supabase
          .from('move_assignments')
          .select(`
            *,
            move_requests (
              pickup_address
            )
          `)
          .order('assigned_date', { ascending: false });

        if (error) {
          throw error;
        }

        if (!assignmentsData) return;

        const formattedAssignments: MoveAssignment[] = assignmentsData.map((assignment: MoveAssignmentWithRequest) => ({
          id: assignment.id,
          request_id: assignment.request_id,
          status: assignment.status,
          assigned_date: assignment.assigned_date || '',
          estimated_cost: assignment.estimated_cost,
          pickup_address: assignment.move_requests.pickup_address
        }));

        setAssignments(formattedAssignments);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        toast({
          title: "Error",
          description: "Failed to load assignments. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();

    const channel = supabase
      .channel('assignments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'move_assignments'
        },
        async (payload) => {
          console.log('Assignment change detected:', payload);
          try {
            await fetchAssignments();
          } catch (error) {
            console.error('Error refreshing assignments:', error);
            toast({
              title: "Error",
              description: "Failed to refresh assignments. Please reload the page.",
              variant: "destructive",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, toast]);

  return (
    <div className="container mx-auto p-6 bg-gradient-to-r from-[#F2FCE2] to-[#E5DEFF]">
      <h1 className="text-2xl font-bold mb-6 text-[#1A1F2C]">Move Assignments Dashboard</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#9b87f5]" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-sm">
          <p className="text-[#8A898C]">No assignments found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-[#F1F0FB]">
              <TableRow>
                <TableHead className="text-[#403E43]">Assignment ID</TableHead>
                <TableHead className="text-[#403E43]">Status</TableHead>
                <TableHead className="text-[#403E43]">Pickup Location</TableHead>
                <TableHead className="text-[#403E43]">Assigned Date</TableHead>
                <TableHead className="text-[#403E43]">Estimated Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id} className="hover:bg-[#F1F0FB] transition-colors">
                  <TableCell className="font-medium text-[#6E59A5]">{assignment.id}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      assignment.status === 'completed' ? 'bg-[#F2FCE2] text-green-700' :
                      assignment.status === 'active' ? 'bg-[#D3E4FD] text-blue-700' :
                      'bg-[#FFDEE2] text-red-700'
                    }`}>
                      {assignment.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-[#403E43]">
                    {assignment.pickup_address?.street}, {assignment.pickup_address?.city}, {assignment.pickup_address?.state}
                  </TableCell>
                  <TableCell className="text-[#403E43]">{new Date(assignment.assigned_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-[#403E43]">${assignment.estimated_cost || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}