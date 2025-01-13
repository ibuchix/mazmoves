import { MoveAssignmentWithRequest } from "@/types/move";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecentAssignmentsProps {
  assignments?: MoveAssignmentWithRequest[];
}

export default function RecentAssignments({ assignments }: RecentAssignmentsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Assignments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assignments?.map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <h3 className="font-medium">
                  {assignment.move_requests.pickup_address.city} to{" "}
                  {assignment.move_requests.delivery_address.city}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Customer: {assignment.move_requests.customer_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Requested for: {new Date(assignment.move_requests.requested_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  Status: {assignment.status}
                </span>
                {assignment.estimated_cost && (
                  <span className="text-sm font-medium">
                    Est. Cost: ${assignment.estimated_cost}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}