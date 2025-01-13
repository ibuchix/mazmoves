import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, DollarSign, Calendar, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface InvoiceStatsProps {
  stats: {
    totalInvoices: number;
    totalPaid: number;
    totalAmount: number;
    nextDueDate: string | null;
  } | null;
}

export default function InvoiceStats({ stats }: InvoiceStatsProps) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalInvoices}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalPaid} paid
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            All time
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalInvoices ? 
              Math.round((stats.totalPaid / stats.totalInvoices) * 100) : 0}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Of invoices paid
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Next Due Date</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.nextDueDate ? 
              format(new Date(stats.nextDueDate), 'MMM d') : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.nextDueDate ? 
              format(new Date(stats.nextDueDate), 'yyyy') : 'No pending invoices'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}