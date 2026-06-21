import { useListClients, getListClientsQueryKey, useCreateClient, useDeleteClient } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "wouter";

export default function Clients() {
  const [search, setSearch] = useState("");
  const { data: clients, isLoading } = useListClients({ search });
  const queryClient = useQueryClient();
  const deleteClient = useDeleteClient();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure?")) {
      deleteClient.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() })
      });
    }
  };

  if (isLoading) return <div className="p-8">Loading clients...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your client relationships.</p>
        </div>
        <Button>Add Client</Button>
      </div>

      <div className="flex items-center gap-4">
        <Input 
          placeholder="Search clients..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients?.map(client => (
          <Card key={client.id}>
            <CardHeader>
              <CardTitle className="flex justify-between">
                <Link href={`/clients/${client.id}`} className="hover:underline">
                  {client.name}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{client.companyName}</p>
              <p className="text-sm">{client.email}</p>
              <p className="text-sm mt-2"><span className="font-semibold text-xs uppercase bg-secondary px-2 py-1 rounded">{client.status}</span></p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(client.id)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {clients?.length === 0 && <div className="col-span-3 text-center py-12 text-muted-foreground">No clients found</div>}
      </div>
    </div>
  );
}
