import { MoveAssignmentWithRequest } from "@/types/move";
import AssignmentCard from "./AssignmentCard";

interface PendingAssignmentsProps {
  assignments: MoveAssignmentWithRequest[];
  onAssignmentUpdate?: () => void;
}

export default function PendingAssignments({ assignments, onAssignmentUpdate }: PendingAssignmentsProps) {
  const pendingAssignments = assignments.filter(a => !a.status);
  
  if (pendingAssignments.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-muted-foreground">No pending assignments</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingAssignments.map((assignment) => (
        <AssignmentCard
          key={assignment.id}
          assignment={assignment}
          onAccept={onAssignmentUpdate}
          onDecline={onAssignmentUpdate}
        />
      ))}
    </div>
  );
}