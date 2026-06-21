import { useListUsers, getListUsersQueryKey, useDeleteUser } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function Team() {
  const { data: users, isLoading } = useListUsers();
  const queryClient = useQueryClient();
  const deleteUser = useDeleteUser();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure?")) {
      deleteUser.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() })
      });
    }
  };

  if (isLoading) return <div className="p-8">Loading team...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground mt-1">Manage user access and roles.</p>
        </div>
        <Button>Invite Member</Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="capitalize">{user.role.replace('_', ' ')}</TableCell>
                <TableCell>
                  <span className="text-xs px-2 py-1 bg-secondary rounded uppercase">{user.status}</span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {!users?.length && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No team members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
