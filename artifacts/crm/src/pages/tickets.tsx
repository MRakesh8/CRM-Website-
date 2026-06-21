import { useListTickets, getListTicketsQueryKey, useDeleteTicket } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Tickets() {
  const { data: tickets, isLoading } = useListTickets();
  const queryClient = useQueryClient();
  const deleteTicket = useDeleteTicket();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure?")) {
      deleteTicket.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListTicketsQueryKey() })
      });
    }
  };

  if (isLoading) return <div className="p-8">Loading tickets...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">Manage client issues and requests.</p>
        </div>
        <Button>Create Ticket</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tickets?.map(ticket => (
          <Card key={ticket.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start text-lg">
                <Link href={`/tickets/${ticket.id}`} className="hover:underline line-clamp-1">
                  {ticket.subject}
                </Link>
                <span className="text-xs font-normal px-2 py-1 bg-secondary rounded uppercase whitespace-nowrap ml-2">{ticket.status}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4 line-clamp-2">{ticket.description || "No description provided."}</div>
              <div className="space-y-1 mb-4 text-sm">
                <p>Client: <span className="font-medium">{ticket.clientName}</span></p>
                <p>Priority: <span className="font-medium capitalize">{ticket.priority}</span></p>
                <p>Assignee: <span className="font-medium">{ticket.assigneeName || 'Unassigned'}</span></p>
              </div>
              <div className="pt-4 border-t border-border flex justify-between">
                <span className="text-xs text-muted-foreground">{ticket.ticketNumber}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(ticket.id)}>Delete</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {tickets?.length === 0 && <div className="col-span-3 text-center py-12 text-muted-foreground">No tickets found</div>}
      </div>
    </div>
  );
}
