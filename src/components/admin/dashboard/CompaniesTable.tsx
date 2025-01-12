import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminDashboardData } from "@/types/admin";

type CompaniesTableProps = {
  companies: AdminDashboardData[];
}

export default function CompaniesTable({ companies }: CompaniesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Companies Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assignments</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Last Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.company_id}>
                <TableCell className="font-medium">{company.company_name}</TableCell>
                <TableCell>
                  <Badge 
                    variant={company.is_verified ? "default" : "secondary"}
                    className={company.is_verified ? "bg-[#84d21f]" : ""}
                  >
                    {company.registration_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {company.total_assignments.toString()} 
                  {company.active_assignments > 0 && 
                    <span className="text-[#84d21f] ml-1">
                      ({company.active_assignments} active)
                    </span>
                  }
                </TableCell>
                <TableCell>${company.total_paid_amount.toFixed(2)}</TableCell>
                <TableCell>
                  {company.last_payment_date 
                    ? new Date(company.last_payment_date).toLocaleDateString()
                    : 'No payments'
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}