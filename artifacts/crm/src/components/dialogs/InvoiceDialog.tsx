import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateInvoice, useUpdateInvoice, getListInvoicesQueryKey, useListClients } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Price must be positive"),
});

const formSchema = z.object({
  clientId: z.coerce.number().min(1, "Client is required"),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
  tax: z.coerce.number().min(0).optional().default(0),
  discount: z.coerce.number().min(0).optional().default(0),
  items: z.array(lineItemSchema).min(1, "At least one item is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: any;
}

export function InvoiceDialog({ open, onOpenChange, invoice }: InvoiceDialogProps) {
  const isEditing = !!invoice;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: clients } = useListClients();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: invoice?.clientId || "",
      status: (invoice?.status as any) || "draft",
      dueDate: invoice?.dueDate ? invoice.dueDate.split('T')[0] : "",
      notes: invoice?.notes || "",
      tax: invoice?.tax || 0,
      discount: invoice?.discount || 0,
      items: invoice?.items || [{ description: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items") || [];
  const tax = form.watch("tax") || 0;
  const discount = form.watch("discount") || 0;

  const subtotal = watchedItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice || 0), 0);
  const total = subtotal + tax - discount;

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      dueDate: new Date(data.dueDate).toISOString(),
      subtotal,
      total,
      items: data.items.map(item => ({ ...item, amount: item.quantity * item.unitPrice }))
    };

    if (isEditing) {
      updateInvoice.mutate({ id: invoice.id, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListInvoicesQueryKey() });
          toast({ title: "Invoice updated successfully" });
          onOpenChange(false);
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Error", description: err?.response?.data?.error || "Failed to update invoice" });
        }
      });
    } else {
      createInvoice.mutate({ data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListInvoicesQueryKey() });
          toast({ title: "Invoice created successfully" });
          onOpenChange(false);
          form.reset();
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Error", description: err?.response?.data?.error || "Failed to create invoice" });
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Invoice" : "Create New Invoice"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value?.toString() || ""}>
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
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date *</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Line Items</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}>
                  <Plus className="w-4 h-4 mr-1" /> Add Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-start bg-muted/20 p-4 rounded-lg border">
                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field: inputField }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Description</FormLabel>
                        <FormControl><Input {...inputField} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field: inputField }) => (
                      <FormItem className="w-24">
                        <FormLabel>Qty</FormLabel>
                        <FormControl><Input type="number" min={1} {...inputField} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.unitPrice`}
                    render={({ field: inputField }) => (
                      <FormItem className="w-32">
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl><Input type="number" step="0.01" min={0} {...inputField} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="w-32 pt-8 text-right font-medium">
                    ${((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unitPrice || 0)).toFixed(2)}
                  </div>
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="mt-8 text-destructive" onClick={() => remove(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-12 border-t pt-4">
              <div className="w-64 space-y-4">
                <div className="flex justify-between font-medium">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <FormField
                  control={form.control}
                  name="tax"
                  render={({ field }) => (
                    <FormItem className="flex justify-between items-center gap-4 space-y-0">
                      <FormLabel className="shrink-0">Tax ($)</FormLabel>
                      <FormControl><Input type="number" step="0.01" min={0} className="w-32 text-right" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem className="flex justify-between items-center gap-4 space-y-0">
                      <FormLabel className="shrink-0">Discount ($)</FormLabel>
                      <FormControl><Input type="number" step="0.01" min={0} className="w-32 text-right" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>${Math.max(0, total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl><Textarea {...field} value={field.value || ""} placeholder="Payment instructions, terms, etc." /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={createInvoice.isPending || updateInvoice.isPending}>
                {isEditing ? "Save Changes" : "Create Invoice"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
