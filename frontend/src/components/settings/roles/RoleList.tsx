import { Role } from "@workspace/api-client-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface RoleListProps {
  roles: Role[];
  isLoading: boolean;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export function RoleList({ roles, isLoading, onEdit, onDelete }: RoleListProps) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "Super Admin";

  if (isLoading) {
    return <div className="text-center py-8">Loading roles...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>System Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="font-medium">
                {role.name}
                {role.name === "Super Admin" && (
                  <ShieldAlert className="inline ml-2 h-4 w-4 text-destructive" />
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {role.description || "-"}
              </TableCell>
              <TableCell>
                {role.isSystem ? (
                  <Badge variant="secondary">System</Badge>
                ) : (
                  <Badge variant="outline">Custom</Badge>
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(role)}
                  disabled={role.isSystem && !isSuperAdmin}
                  title={role.isSystem && !isSuperAdmin ? "Only Super Admin can edit system roles" : "Edit Role"}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(role)}
                  disabled={role.isSystem}
                  title={role.isSystem ? "System roles cannot be deleted" : "Delete Role"}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {roles.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No roles found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
