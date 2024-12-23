import { useEffect, useState } from "react";
import { useRealtimeAssignments } from "@/hooks/use-realtime-assignments";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MoveAssignment {
  id: string;
  request_id: string;
  status: string;
  assigned_date: string;
  estimated_cost: number;
  pickup_address: {
    street: string;
    city: string;
    state: string;
  };
}

export default function Index() {
  useRealtimeAssignments(); // This handles the real-time notifications
  const [assignments, setAssignments] = useState<MoveAssignment[]>([]);
  const { session } = useAuth();

  useEffect(() => {
    // Fetch initial assignments
    const fetchAssignments = async () => {
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
        console.error('Error fetching assignments:', error);
        return;
      }

      setAssignments(assignmentsData.map(assignment => ({
        ...assignment,
        pickup_address: assignment.move_requests.pickup_address
      })));
    };

    fetchAssignments();

    // Subscribe to changes in assignments
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
          // Refresh the assignments list
          await fetchAssignments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Move Assignments Dashboard</h1>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Assignment ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pickup Location</TableHead>
            <TableHead>Assigned Date</TableHead>
            <TableHead>Estimated Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((assignment) => (
            <TableRow key={assignment.id}>
              <TableCell>{assignment.id}</TableCell>
              <TableCell>{assignment.status}</TableCell>
              <TableCell>
                {assignment.pickup_address?.street}, {assignment.pickup_address?.city}, {assignment.pickup_address?.state}
              </TableCell>
              <TableCell>{new Date(assignment.assigned_date).toLocaleDateString()}</TableCell>
              <TableCell>${assignment.estimated_cost || 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}