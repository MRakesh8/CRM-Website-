import { useListPayments, getListPaymentsQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function Payments() {
  const { data: payments, isLoading } = useListPayments();

  if (isLoading) return <div className="p-8">Loading payments...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground mt-1">Track payment history.</p>
        </div>
        <Button>Record Payment</Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments?.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{payment.invoiceNumber || '-'}</TableCell>
                <TableCell>{payment.clientName || '-'}</TableCell>
                <TableCell className="capitalize">{payment.method.replace('_', ' ')}</TableCell>
                <TableCell>
                  <span className="text-xs px-2 py-1 bg-secondary rounded uppercase">{payment.status}</span>
                </TableCell>
                <TableCell className="text-right font-medium">${payment.amount.toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {!payments?.length && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No payments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
