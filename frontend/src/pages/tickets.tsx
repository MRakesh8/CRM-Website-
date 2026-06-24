import { useState } from "react";
import { useListTickets, getListTicketsQueryKey, useDeleteTicket } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { TicketDialog } from "@/components/dialogs/TicketDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Ticket, MessageSquare } from "lucide-react";

export default function Tickets() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: tickets, isLoading } = useListTickets();
  const queryClient = useQueryClient();
  const deleteTicket = useDeleteTicket();
  const { toast } = useToast();

  const filteredTickets = tickets?.filter(t => statusFilter === "all" || t.status === statusFilter) || [];

  const handleCreate = () => {
    setEditingTicket(null);
    setDialogOpen(true);
  };

  const handleEdit = (ticket: any) => {
    setEditingTicket(ticket);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteTicket.mutate({ id: deleteId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTicketsQueryKey() });
        toast({ title: "Ticket deleted successfully" });
        setDeleteId(null);
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Error", description: err?.response?.data?.error || "Failed to delete ticket" });
        setDeleteId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">Manage client issues, requests, and inquiries.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" /> Create Ticket
        </Button>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="flex flex-wrap h-auto justify-start bg-transparent border-b rounded-none w-full p-0 space-x-6 overflow-x-auto">
          <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 pt-2">All Tickets</TabsTrigger>
          <TabsTrigger value="open" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 pt-2">Open</TabsTrigger>
          <TabsTrigger value="in_progress" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 pt-2">In Progress</TabsTrigger>
          <TabsTrigger value="resolved" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 pt-2">Resolved</TabsTrigger>
          <TabsTrigger value="closed" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 pt-2">Closed</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="border rounded-md bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="pl-6 font-semibold">Ticket #</TableHead>
              <TableHead className="font-semibold">Subject</TableHead>
              <TableHead className="font-semibold">Client</TableHead>
              <TableHead className="font-semibold">Priority</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Assignee</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="text-right pr-6 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-6"><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell className="pr-6"><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredTickets.length > 0 ? (
              filteredTickets.map(ticket => (
                <TableRow key={ticket.id} className="hover:bg-muted/50 transition-colors group">
                  <TableCell className="font-medium pl-6 text-muted-foreground">{ticket.ticketNumber || `#TCK-${ticket.id}`}</TableCell>
                  <TableCell>
                    <Link href={`/tickets/${ticket.id}`} className="font-semibold text-primary hover:underline line-clamp-1">
                      {ticket.subject}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/clients/${ticket.clientId}`} className="text-foreground hover:underline">
                      {ticket.clientName}
                    </Link>
                  </TableCell>
                  <TableCell><PriorityBadge priority={ticket.priority} /></TableCell>
                  <TableCell><StatusBadge status={ticket.status} type="ticket" /></TableCell>
                  <TableCell className="text-muted-foreground">{ticket.assigneeName || "-"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/tickets/${ticket.id}`}>View</Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(ticket)}>Edit</Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteId(ticket.id)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium">No tickets found</p>
                    <p className="text-sm mb-4">You have no support tickets in this category.</p>
                    <Button variant="outline" onClick={handleCreate}>Create Ticket</Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TicketDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        ticket={editingTicket} 
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Ticket"
        description="Are you sure you want to delete this support ticket? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  );
}
