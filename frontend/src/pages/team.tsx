import { useState } from "react";
import { useListUsers, getListUsersQueryKey, useDeleteUser } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, RoleBadge } from "@/components/StatusBadge";
import { TeamMemberDialog } from "@/components/dialogs/TeamMemberDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, ShieldAlert, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Team() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: users, isLoading } = useListUsers();
  const queryClient = useQueryClient();
  const deleteUser = useDeleteUser();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const handleCreate = () => {
    setEditingUser(null);
    setDialogOpen(true);
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteUser.mutate({ id: deleteId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        toast({ title: "User deleted successfully" });
        setDeleteId(null);
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Error", description: err?.response?.data?.error || "Failed to delete user" });
        setDeleteId(null);
      }
    });
  };

  const canCreate = currentUser?.role === 'Super Admin' || currentUser?.permissions?.includes('create_users');
  const canEdit = currentUser?.role === 'Super Admin' || currentUser?.permissions?.includes('edit_users');
  const canDelete = currentUser?.role === 'Super Admin' || currentUser?.permissions?.includes('delete_users');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground mt-1">Manage user access, roles, and permissions.</p>
        </div>
        {canCreate && (
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" /> Add Team Member
          </Button>
        )}
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="pl-6 font-semibold">User</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Joined</TableHead>
              {(canEdit || canDelete) && <TableHead className="text-right pr-6 font-semibold">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-6"><Skeleton className="h-5 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  {(canEdit || canDelete) && <TableCell className="pr-6"><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>}
                </TableRow>
              ))
            ) : users && users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="pl-6 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        {user.name}
                        {currentUser?.id === user.id && <span className="ml-2 text-xs text-muted-foreground font-normal bg-muted px-1.5 py-0.5 rounded">You</span>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                    {user.role === "Super Admin" && <ShieldAlert className="inline ml-2 h-4 w-4 text-destructive" />}
                  </TableCell>
                  <TableCell><StatusBadge status={user.isActive ? 'active' : 'suspended'} type="user" /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  {(canEdit || canDelete) && (
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        {canEdit && (
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(user)} disabled={user.role === "Super Admin" && currentUser?.role !== "Super Admin"}>Edit</Button>
                        )}
                        {canDelete && currentUser?.id !== user.id && (
                          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteId(user.id)} disabled={user.role === "Super Admin" && currentUser?.role !== "Super Admin"}>Delete</Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={(canEdit || canDelete) ? 6 : 5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Users className="w-12 h-12 mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium">No team members found</p>
                    <p className="text-sm mb-4">Add people to collaborate in your workspace.</p>
                    {canCreate && <Button variant="outline" onClick={handleCreate}>Add Team Member</Button>}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TeamMemberDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        user={editingUser} 
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Remove Team Member"
        description="Are you sure you want to remove this user from the workspace? They will lose all access immediately."
        onConfirm={handleDelete}
      />
    </div>
  );
}
