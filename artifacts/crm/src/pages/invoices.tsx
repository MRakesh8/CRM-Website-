import { useListInvoices, getListInvoicesQueryKey, useDeleteInvoice } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Invoices() {
  const { data: invoices, isLoading } = useListInvoices();
  const queryClient = useQueryClient();
  const deleteInvoice = useDeleteInvoice();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure?")) {
      deleteInvoice.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListInvoicesQueryKey() })
      });
    }
  };

  if (isLoading) return <div className="p-8">Loading invoices...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage billing and invoices.</p>
        </div>
        <Button>Create Invoice</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {invoices?.map(invoice => (
          <Card key={invoice.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-lg">
                <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                  {invoice.invoiceNumber}
                </Link>
                <span className="text-xs font-normal px-2 py-1 bg-secondary rounded uppercase">{invoice.status}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 mb-4">
                <p className="text-sm text-muted-foreground">Client: <span className="font-medium text-foreground">{invoice.clientName}</span></p>
                <p className="text-sm text-muted-foreground">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>
              <div className="pt-4 border-t border-border flex justify-between items-center">
                <span className="font-medium text-lg">${invoice.total.toLocaleString()}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(invoice.id)}>Delete</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {invoices?.length === 0 && <div className="col-span-3 text-center py-12 text-muted-foreground">No invoices found</div>}
      </div>
    </div>
  );
}
