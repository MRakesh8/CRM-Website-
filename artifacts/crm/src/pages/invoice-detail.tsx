import { useParams, Link } from "wouter";
import { useGetInvoice } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, Printer, Download, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export default function InvoiceDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0", 10);
  
  const { data: invoice, isLoading } = useGetInvoice(id);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <div className="p-8 space-y-8 max-w-4xl mx-auto"><Skeleton className="h-12 w-1/3" /><Skeleton className="h-96 w-full" /></div>;
  if (!invoice) return <div className="p-8 text-center">Invoice not found</div>;

  const isOverdue = invoice.status !== 'paid' && invoice.status !== 'cancelled' && new Date(invoice.dueDate) < new Date();
  const displayStatus = isOverdue ? 'overdue' : invoice.status;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Header controls - Hidden when printing */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <Link href="/invoices" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Print / PDF
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            <Mail className="w-4 h-4 mr-2" /> Send to Client
          </Button>
        </div>
      </div>

      {/* The Invoice Document */}
      <div className="bg-card border shadow-sm sm:rounded-xl overflow-hidden print:border-none print:shadow-none">
        {/* Invoice Top Header */}
        <div className="bg-primary p-8 text-primary-foreground flex justify-between items-start print:bg-slate-800 print:text-white">
          <div>
            <h1 className="text-3xl font-black tracking-tighter">NexusCRM</h1>
            <p className="opacity-80 mt-1">Professional Services</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold uppercase tracking-widest opacity-90">Invoice</h2>
            <p className="text-lg mt-1 font-medium">{invoice.invoiceNumber}</p>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          {/* Status & Dates */}
          <div className="flex flex-col sm:flex-row justify-between border-b pb-8 mb-8 gap-6">
            <div className="space-y-4">
              <div className="print:hidden">
                <div className="text-sm text-muted-foreground mb-1">Status</div>
                <StatusBadge status={displayStatus} type="invoice" className="text-xs px-3 py-1" />
              </div>
            </div>
            <div className="flex gap-12 sm:text-right">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Issue Date</div>
                <div className="font-medium">{new Date(invoice.createdAt).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Due Date</div>
                <div className={cn("font-medium", isOverdue && "text-red-500 print:text-black")}>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Billing Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mb-12">
            <div>
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Bill To</div>
              <h3 className="text-xl font-bold mb-1">{invoice.clientName}</h3>
              {/* Assuming client address would be here if populated */}
              <p className="text-muted-foreground whitespace-pre-wrap">
                {/* Fallback to placeholder if not included in invoice payload directly */}
                Client ID: {invoice.clientId}
              </p>
            </div>
            <div className="sm:text-right">
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Pay To</div>
              <h3 className="text-lg font-bold mb-1">NexusCRM Inc.</h3>
              <p className="text-muted-foreground">
                100 Innovation Drive<br />
                San Francisco, CA 94103<br />
                billing@nexuscrm.app
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-foreground">
                  <th className="py-3 px-2 font-bold text-muted-foreground uppercase text-xs tracking-wider">Description</th>
                  <th className="py-3 px-2 font-bold text-muted-foreground uppercase text-xs tracking-wider text-right">Qty</th>
                  <th className="py-3 px-2 font-bold text-muted-foreground uppercase text-xs tracking-wider text-right">Unit Price</th>
                  <th className="py-3 px-2 font-bold text-muted-foreground uppercase text-xs tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, i) => (
                    <tr key={i} className="hover:bg-muted/30 print:hover:bg-transparent">
                      <td className="py-4 px-2 font-medium">{item.description}</td>
                      <td className="py-4 px-2 text-right text-muted-foreground">{item.quantity}</td>
                      <td className="py-4 px-2 text-right text-muted-foreground">${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-4 px-2 text-right font-medium">${(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted-foreground italic">No line items provided</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Calculation */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
            <div className="w-full sm:w-1/2">
              {invoice.notes && (
                <div className="bg-muted/30 p-4 rounded-lg print:border print:bg-transparent">
                  <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Notes & Terms</div>
                  <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
            </div>
            
            <div className="w-full sm:w-1/3 space-y-3">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${(invoice.subtotal ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              
              {(invoice.tax ?? 0) > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span>+${(invoice.tax ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              
              {(invoice.discount ?? 0) > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 print:text-black">
                  <span>Discount</span>
                  <span>-${(invoice.discount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              
              <div className="flex justify-between items-end border-t-2 border-foreground pt-4 mt-2">
                <span className="text-xl font-bold uppercase tracking-wider">Total</span>
                <span className="text-3xl font-black text-primary print:text-black">${invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Footer signature */}
          <div className="mt-24 pt-8 border-t text-center text-muted-foreground text-sm flex flex-col items-center">
            <div className="font-bold text-foreground mb-1">Thank you for your business.</div>
            <p>Please make payment within 14 days of receiving this invoice.</p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .no-print { display: none !important; }
          .bg-card { visibility: visible; position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: none; }
          .bg-card * { visibility: visible; }
          @page { margin: 0; size: auto; }
        }
      `}} />
    </div>
  );
}
