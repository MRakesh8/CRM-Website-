import { useParams, Link } from "wouter";
import { useState } from "react";
import { useGetTicket, useUpdateTicket, getGetTicketQueryKey, getListTicketsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { ArrowLeft, User, Calendar, MessageSquare, AlertCircle, Edit2, Play, CheckCircle2, XCircle } from "lucide-react";
import { TicketDialog } from "@/components/dialogs/TicketDialog";
import { useToast } from "@/hooks/use-toast";

export default function TicketDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0", 10);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { data: ticket, isLoading } = useGetTicket(id);
  const updateTicket = useUpdateTicket();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = (newStatus: "open" | "in_progress" | "resolved" | "closed") => {
    if (!ticket) return;
    updateTicket.mutate({ id: ticket.id, data: { status: newStatus } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTicketQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListTicketsQueryKey() });
        toast({ title: "Ticket status updated" });
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Error", description: err?.response?.data?.error || "Failed to update status" });
      }
    });
  };

  if (isLoading) return <div className="p-8 space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64 w-full" /></div>;
  if (!ticket) return <div className="p-8 text-center text-muted-foreground">Ticket not found</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-2">
          <Link href="/tickets" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3">
            <ArrowLeft className="w-4 h-4" /> Back to Tickets
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xl font-medium text-muted-foreground">{ticket.ticketNumber || `#TCK-${ticket.id}`}</span>
            <StatusBadge status={ticket.status} type="ticket" className="text-sm px-3 py-1" />
            <PriorityBadge priority={ticket.priority} className="text-sm px-3 py-1" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{ticket.subject}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            <Edit2 className="w-4 h-4 mr-2" /> Edit Details
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border shadow-sm min-h-[300px]">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" /> Description
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                {ticket.description || <span className="text-muted-foreground italic">No description provided for this ticket.</span>}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" /> Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                {ticket.status !== 'in_progress' && (
                  <Button 
                    variant="outline" 
                    className="border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-900 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                    onClick={() => handleStatusChange('in_progress')}
                    disabled={updateTicket.isPending}
                  >
                    <Play className="w-4 h-4 mr-2" /> Mark In Progress
                  </Button>
                )}
                {ticket.status !== 'resolved' && (
                  <Button 
                    variant="outline" 
                    className="border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-900 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
                    onClick={() => handleStatusChange('resolved')}
                    disabled={updateTicket.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Resolved
                  </Button>
                )}
                {ticket.status !== 'closed' && (
                  <Button 
                    variant="outline" 
                    className="border-slate-200 hover:bg-slate-100 hover:text-slate-800 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                    onClick={() => handleStatusChange('closed')}
                    disabled={updateTicket.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Close Ticket
                  </Button>
                )}
                {(ticket.status === 'resolved' || ticket.status === 'closed') && (
                  <Button 
                    variant="outline"
                    onClick={() => handleStatusChange('open')}
                    disabled={updateTicket.isPending}
                  >
                    Reopen Ticket
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-lg">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Client</div>
                <Link href={`/clients/${ticket.clientId}`} className="text-lg font-semibold text-primary hover:underline">
                  {ticket.clientName}
                </Link>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Assignee</div>
                    <div className="font-medium">{ticket.assigneeName || <span className="text-muted-foreground italic">Unassigned</span>}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Created At</div>
                    <div className="font-medium">{new Date(ticket.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</div>
                  </div>
                </div>
                
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <TicketDialog open={dialogOpen} onOpenChange={setDialogOpen} ticket={ticket} />
    </div>
  );
}
