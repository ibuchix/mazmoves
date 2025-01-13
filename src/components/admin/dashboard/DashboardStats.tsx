import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, CheckCircle, AlertCircle } from "lucide-react";

type DashboardStatsProps = {
  totalCompanies: number;
  verifiedCompanies: number;
  totalAssignments: number;
  totalRevenue: number;
}

export default function DashboardStats({
  totalCompanies,
  verifiedCompanies,
  totalAssignments,
  totalRevenue
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCompanies.toString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {verifiedCompanies} verified
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Verified Companies</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{verifiedCompanies.toString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {((verifiedCompanies / totalCompanies) * 100).toFixed(1)}% of total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAssignments.toString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {(totalAssignments / Math.max(verifiedCompanies, 1)).toFixed(1)} per company
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            ${(totalRevenue / Math.max(totalCompanies, 1)).toFixed(2)} per company
          </p>
        </CardContent>
      </Card>
    </div>
  );
}