import { useState } from "react";
import { Plus } from "lucide-react";
import { useListRoles, useDeleteRole, Role } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { RoleList } from "@/components/settings/roles/RoleList";
import { RoleDialog } from "@/components/dialogs/RoleDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function RolesPage() {
  const { data: roles, isLoading } = useListRoles();
  const deleteRole = useDeleteRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const handleCreate = () => {
    setSelectedRole(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsDialogOpen(true);
  };

  const handleDeleteRequest = (role: Role) => {
    setRoleToDelete(role);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    try {
      await deleteRole.mutateAsync({ id: roleToDelete.id });
      toast({ title: "Success", description: "Role deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["listRoles"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete role",
        variant: "destructive",
      });
    } finally {
      setIsConfirmOpen(false);
      setRoleToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground mt-2">
            Manage system roles and their access permissions.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      <RoleList 
        roles={roles || []} 
        isLoading={isLoading} 
        onEdit={handleEdit} 
        onDelete={handleDeleteRequest} 
      />

      {isDialogOpen && (
        <RoleDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          role={selectedRole}
        />
      )}

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Delete Role"
        description={`Are you sure you want to delete the role "${roleToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        isDestructive={true}
      />
    </div>
  );
}
