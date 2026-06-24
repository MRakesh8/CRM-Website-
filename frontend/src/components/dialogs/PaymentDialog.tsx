import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreatePayment, useUpdatePayment, getListPaymentsQueryKey, useListClients, useListInvoices } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";

const formSchema = z.object({
  clientId: z.coerce.number().min(1, "Client is required"),
  invoiceId: z.coerce.number().optional().nullable(),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  method: z.enum(["bank_transfer", "upi", "credit_card", "cash"]),
  status: z.enum(["pending", "paid", "failed", "refunded"]),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: any;
}

export function PaymentDialog({ open, onOpenChange, payment }: PaymentDialogProps) {
  const isEditing = !!payment;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: clients } = useListClients();
  
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();

  const { currency, convertToUSD, convertFromUSD, formatCurrency } = useCurrency();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: payment?.clientId || "",
      invoiceId: payment?.invoiceId || null,
      amount: payment?.amount ? convertFromUSD(payment.amount) : ("" as unknown as number),
      method: (payment?.method as any) || "bank_transfer",
      status: (payment?.status as any) || "paid",
      notes: payment?.notes || "",
    },
  });

  const selectedClientId = form.watch("clientId");
  const { data: invoices } = useListInvoices(selectedClientId ? { clientId: Number(selectedClientId) } : undefined);

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      amount: convertToUSD(data.amount),
      invoiceId: data.invoiceId ?? undefined,
    };

    if (isEditing) {
      updatePayment.mutate({ id: payment.id, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
          toast({ title: "Payment updated successfully" });
          onOpenChange(false);
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Error", description: err?.response?.data?.error || "Failed to update payment" });
        }
      });
    } else {
      createPayment.mutate({ data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
          toast({ title: "Payment recorded successfully" });
          onOpenChange(false);
          form.reset();
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Error", description: err?.response?.data?.error || "Failed to record payment" });
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Payment" : "Record Payment"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client *</FormLabel>
                  <Select onValueChange={(val) => { field.onChange(val); form.setValue("invoiceId", null); }} defaultValue={field.value?.toString() || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients?.map(client => (
                        <SelectItem key={client.id} value={client.id.toString()}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="invoiceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value?.toString() || ""} disabled={!selectedClientId}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select invoice (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {invoices?.map(inv => (
                        <SelectItem key={inv.id} value={inv.id.toString()}>{inv.invoiceNumber} ({formatCurrency(inv.total)})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount ({currency}) *</FormLabel>
                  <FormControl><Input type="number" step="0.01" min={0.01} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Method *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl><Textarea {...field} value={field.value || ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={createPayment.isPending || updatePayment.isPending}>
                {isEditing ? "Save Changes" : "Record Payment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
