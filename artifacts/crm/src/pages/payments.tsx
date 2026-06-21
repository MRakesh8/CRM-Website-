import { useState } from "react";
import { useListPayments } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentDialog } from "@/components/dialogs/PaymentDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, CreditCard, Banknote, Landmark, Smartphone } from "lucide-react";
import { Link } from "wouter";

export default function Payments() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);

  const { data: payments, isLoading } = useListPayments();

  const filteredPayments = payments?.filter(p => statusFilter === "all" || p.status === statusFilter) || [];

  const handleCreate = () => {
    setEditingPayment(null);
    setDialogOpen(true);
  };

  const handleEdit = (payment: any) => {
    setEditingPayment(payment);
    setDialogOpen(true);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card': return <CreditCard className="w-4 h-4 text-blue-500" />;
      case 'bank_transfer': return <Landmark className="w-4 h-4 text-emerald-500" />;
      case 'cash': return <Banknote className="w-4 h-4 text-green-600" />;
      case 'upi': return <Smartphone className="w-4 h-4 text-purple-500" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground mt-1">Track incoming transactions and receipts.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" /> Record Payment
        </Button>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-auto p-0 space-x-6 overflow-x-auto">
          <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 pt-2">All Transactions</TabsTrigger>
          <TabsTrigger value="paid" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 pt-2">Completed</TabsTrigger>
          <TabsTrigger value="pending" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 pt-2">Pending</TabsTrigger>
          <TabsTrigger value="failed" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 pt-2">Failed</TabsTrigger>
          <TabsTrigger value="refunded" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 pt-2">Refunded</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="pl-6">Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Invoice Ref</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-6"><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[80px] ml-auto" /></TableCell>
                  <TableCell className="pr-6"><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="pl-6 font-medium">
                    {new Date(payment.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    <div className="text-xs text-muted-foreground font-normal">
                      {new Date(payment.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/clients/${payment.clientId}`} className="hover:underline text-foreground">
                      {payment.clientName || '-'}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {payment.invoiceId ? (
                      <Link href={`/invoices/${payment.invoiceId}`} className="text-primary hover:underline">
                        {payment.invoiceNumber}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground italic text-sm">Direct Payment</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="bg-muted p-1.5 rounded-md">
                        {getMethodIcon(payment.method)}
                      </div>
                      <span className="capitalize text-sm font-medium">{payment.method.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={payment.status} type="payment" />
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg">
                    ${payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(payment)}>Edit</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <CreditCard className="w-12 h-12 mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium">No payments found</p>
                    <p className="text-sm mb-4">You haven't recorded any payments yet.</p>
                    <Button variant="outline" onClick={handleCreate}>Record Payment</Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PaymentDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        payment={editingPayment} 
      />

    </div>
  );
}
