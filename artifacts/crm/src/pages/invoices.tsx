import { useState } from "react";
import { useListInvoices, getListInvoicesQueryKey, useDeleteInvoice } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { InvoiceDialog } from "@/components/dialogs/InvoiceDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Invoices() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: invoices, isLoading } = useListInvoices();
  const queryClient = useQueryClient();
  const deleteInvoice = useDeleteInvoice();
  const { toast } = useToast();

  const filteredInvoices = invoices?.filter(i => statusFilter === "all" || i.status === statusFilter) || [];

  const handleCreate = () => {
    setEditingInvoice(null);
    setDialogOpen(true);
  };

  const handleEdit = (invoice: any) => {
    setEditingInvoice(invoice);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteInvoice.mutate({ id: deleteId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListInvoicesQueryKey() });
        toast({ title: "Invoice deleted successfully" });
        setDeleteId(null);
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Error", description: err?.response?.data?.error || "Failed to delete invoice" });
        setDeleteId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage billing, send invoices, and track revenue.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" /> Create Invoice
        </Button>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="flex flex-wrap h-auto justify-start bg-transparent border-b rounded-none w-full p-0 space-x-6">
          <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 pt-2">All Invoices</TabsTrigger>
          <TabsTrigger value="draft" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 pt-2">Draft</TabsTrigger>
          <TabsTrigger value="sent" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 pt-2">Sent</TabsTrigger>
          <TabsTrigger value="paid" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 pt-2">Paid</TabsTrigger>
          <TabsTrigger value="overdue" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 pt-2">Overdue</TabsTrigger>
          <TabsTrigger value="cancelled" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 pt-2">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="border rounded-md bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="pl-6 font-semibold">Invoice #</TableHead>
              <TableHead className="font-semibold">Client</TableHead>
              <TableHead className="font-semibold">Issue Date</TableHead>
              <TableHead className="font-semibold">Due Date</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="text-right font-semibold">Amount</TableHead>
              <TableHead className="text-right pr-6 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-6"><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px] ml-auto" /></TableCell>
                  <TableCell className="pr-6"><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredInvoices.length > 0 ? (
              filteredInvoices.map(invoice => {
                const isOverdue = invoice.status !== 'paid' && invoice.status !== 'cancelled' && new Date(invoice.dueDate) < new Date();
                return (
                  <TableRow key={invoice.id} className="hover:bg-muted/50 transition-colors group">
                    <TableCell className="font-medium pl-6">
                      <Link href={`/invoices/${invoice.id}`} className="text-primary hover:underline flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        {invoice.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/clients/${invoice.clientId}`} className="hover:underline text-foreground">
                        {invoice.clientName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className={cn("text-sm", isOverdue && "text-red-500 font-medium")}>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={isOverdue ? 'overdue' : invoice.status} type="invoice" />
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ${invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/invoices/${invoice.id}`}>View</Link>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(invoice)}>Edit</Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteId(invoice.id)}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FileText className="w-12 h-12 mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium">No invoices found</p>
                    <p className="text-sm mb-4">You haven't generated any invoices in this category.</p>
                    <Button variant="outline" onClick={handleCreate}>Create Invoice</Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <InvoiceDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        invoice={editingInvoice} 
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Invoice"
        description="Are you sure you want to delete this invoice? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  );
}
