import { useParams, Link } from "wouter";
import { useGetClient, useListProjects, useListInvoices, useListTickets } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { ArrowLeft, Building, Mail, Phone, MapPin, Globe, Briefcase, FileText, Ticket } from "lucide-react";
import { ClientDialog } from "@/components/dialogs/ClientDialog";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function ClientDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0", 10);
  const { formatCurrency } = useCurrency();
  
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: client, isLoading: clientLoading } = useGetClient(id);
  const { data: projects, isLoading: projectsLoading } = useListProjects();
  const { data: invoices, isLoading: invoicesLoading } = useListInvoices();
  const { data: tickets, isLoading: ticketsLoading } = useListTickets();

  const clientProjects = projects?.filter(p => p.clientId === id) || [];
  const clientInvoices = invoices?.filter(i => i.clientId === id) || [];
  const clientTickets = tickets?.filter(t => t.clientId === id) || [];

  if (clientLoading) return <div className="p-8 space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64 w-full" /></div>;
  if (!client) return <div className="p-8">Client not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/clients" className="hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Clients
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
            <StatusBadge status={client.status} type="client" />
          </div>
          <p className="text-muted-foreground">{client.companyName || "No company specified"}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>Edit Client</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-border shadow-sm">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Email</div>
                <a href={`mailto:${client.email}`} className="text-sm text-primary hover:underline">{client.email}</a>
              </div>
            </div>
            {client.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Phone</div>
                  <a href={`tel:${client.phone}`} className="text-sm text-primary hover:underline">{client.phone}</a>
                </div>
              </div>
            )}
            {client.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Address</div>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">{client.address}</div>
                </div>
              </div>
            )}
            {client.website && (
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Website</div>
                  <a href={client.website.startsWith('http') ? client.website : `https://${client.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{client.website}</a>
                </div>
              </div>
            )}
            {client.industry && (
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Industry</div>
                  <div className="text-sm text-muted-foreground">{client.industry}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5" /> Projects</CardTitle>
                <CardDescription>Associated projects for this client</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {projectsLoading ? <Skeleton className="h-32 w-full" /> : 
                clientProjects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {clientProjects.map(project => (
                      <div key={project.id} className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <Link href={`/projects/${project.id}`} className="font-semibold text-primary hover:underline">{project.name}</Link>
                          <StatusBadge status={project.status} type="project" />
                        </div>
                        <div className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</div>
                        <div className="text-xs text-muted-foreground flex justify-between">
                          <span>Progress: {project.progress}%</span>
                          {project.budget && <span>{formatCurrency(project.budget)}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div className="text-sm text-muted-foreground text-center py-6 border rounded-lg bg-muted/20">No projects found.</div>
              }
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? <Skeleton className="h-32 w-full" /> : 
                clientInvoices.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientInvoices.slice(0, 5).map(invoice => (
                        <TableRow key={invoice.id}>
                          <TableCell><Link href={`/invoices/${invoice.id}`} className="font-medium text-primary hover:underline">{invoice.invoiceNumber}</Link></TableCell>
                          <TableCell><StatusBadge status={invoice.status} type="invoice" /></TableCell>
                          <TableCell className="text-sm">{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(invoice.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : <div className="text-sm text-muted-foreground text-center py-6 border rounded-lg bg-muted/20">No invoices found.</div>
              }
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Ticket className="w-5 h-5" /> Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              {ticketsLoading ? <Skeleton className="h-32 w-full" /> : 
                clientTickets.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientTickets.map(ticket => (
                        <TableRow key={ticket.id}>
                          <TableCell><Link href={`/tickets/${ticket.id}`} className="font-medium text-primary hover:underline line-clamp-1">{ticket.subject}</Link></TableCell>
                          <TableCell><PriorityBadge priority={ticket.priority} /></TableCell>
                          <TableCell><StatusBadge status={ticket.status} type="ticket" /></TableCell>
                          <TableCell className="text-sm text-muted-foreground">{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : <div className="text-sm text-muted-foreground text-center py-6 border rounded-lg bg-muted/20">No support tickets found.</div>
              }
            </CardContent>
          </Card>
        </div>
      </div>

      <ClientDialog open={dialogOpen} onOpenChange={setDialogOpen} client={client} />
    </div>
  );
}
