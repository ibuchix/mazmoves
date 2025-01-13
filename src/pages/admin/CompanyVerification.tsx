import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, ShieldCheck, ShieldX } from "lucide-react";
import { toast } from "sonner";

interface UnverifiedCompany {
  id: string;
  name: string;
  contact_email: string;
  manager_name: string | null;
  registration_date: string;
  registration_status: string;
}

export default function CompanyVerification() {
  const { data: unverifiedCompanies, refetch } = useQuery({
    queryKey: ["unverified-companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('is_verified', false)
        .order('registration_date', { ascending: false });
      
      if (error) throw error;
      return data as UnverifiedCompany[];
    },
  });

  const handleVerification = async (companyId: string, approve: boolean) => {
    try {
      if (approve) {
        // Call the verify-company edge function
        const { error: verificationError } = await supabase.functions.invoke('verify-company', {
          body: { 
            companyId,
            verificationNotes: 'Approved by admin'
          }
        });

        if (verificationError) {
          console.error("Verification error:", verificationError);
          toast.error("Failed to verify company");
          return;
        }

        toast.success("Company verified successfully");
      } else {
        // Handle rejection directly since it doesn't require email notification
        const { error: updateError } = await supabase
          .from('companies')
          .update({ 
            registration_status: 'rejected',
            verification_notes: 'Rejected by admin'
          })
          .eq('id', companyId);

        if (updateError) {
          console.error("Rejection error:", updateError);
          toast.error("Failed to reject company");
          return;
        }

        toast.success("Company rejected successfully");
      }

      refetch();
    } catch (error) {
      console.error("Error during verification:", error);
      toast.error("An error occurred during verification");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-[#040480]" />
        <h1 className="text-3xl font-bold text-[#040480]">Company Verification</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Pending Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Contact Email</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unverifiedCompanies?.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.manager_name || 'N/A'}</TableCell>
                  <TableCell>{company.contact_email}</TableCell>
                  <TableCell>
                    {new Date(company.registration_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800"
                    >
                      {company.registration_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-[#84d21f] hover:bg-[#6ab019] text-white border-none"
                        onClick={() => handleVerification(company.id, true)}
                      >
                        <ShieldCheck className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-[#d2491f] hover:bg-[#b33d19] text-white border-none"
                        onClick={() => handleVerification(company.id, false)}
                      >
                        <ShieldX className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!unverifiedCompanies || unverifiedCompanies.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No pending verifications
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}