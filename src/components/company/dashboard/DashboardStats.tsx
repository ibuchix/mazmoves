import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Truck, XCircle } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    active: number;
    completed: number;
    cancelled: number;
    pending: number;
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Active Assignments"
        value={stats.active}
        icon={<Truck className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Pending Estimates"
        value={stats.pending}
        icon={<Clock className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Completed Moves"
        value={stats.completed}
        icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Cancelled"
        value={stats.cancelled}
        icon={<XCircle className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}