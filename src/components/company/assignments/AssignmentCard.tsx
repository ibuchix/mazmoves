import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MoveAssignmentWithRequest } from "@/types/move";
import { CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AssignmentCardProps {
  assignment: MoveAssignmentWithRequest;
  onAccept?: () => void;
  onDecline?: () => void;
}

export default function AssignmentCard({ assignment, onAccept, onDecline }: AssignmentCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('move_assignments')
        .update({ status: 'active' })
        .eq('id', assignment.id);

      if (error) throw error;
      
      toast.success("Assignment accepted successfully!");
      onAccept?.();
    } catch (error) {
      console.error('Error accepting assignment:', error);
      toast.error("Failed to accept assignment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('move_assignments')
        .update({ status: 'cancelled' })
        .eq('id', assignment.id);

      if (error) throw error;
      
      toast.success("Assignment declined");
      onDecline?.();
    } catch (error) {
      console.error('Error declining assignment:', error);
      toast.error("Failed to decline assignment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          New Move Request
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">From</p>
          <p className="text-base">{assignment.move_requests.pickup_address.city}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">To</p>
          <p className="text-base">{assignment.move_requests.delivery_address.city}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Customer</p>
          <p className="text-base">{assignment.move_requests.customer_name}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Requested Date</p>
          <p className="text-base">
            {new Date(assignment.move_requests.requested_date).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={handleDecline}
          disabled={isLoading}
          className="bg-red-50 hover:bg-red-100 text-red-600"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Decline
        </Button>
        <Button
          onClick={handleAccept}
          disabled={isLoading}
          className="bg-[#040480] hover:bg-[#1f3dd2]"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Accept
        </Button>
      </CardFooter>
    </Card>
  );
}