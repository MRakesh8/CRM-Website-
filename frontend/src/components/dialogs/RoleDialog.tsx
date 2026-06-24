import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateRole, useUpdateRole, useListPermissions, Role } from "@workspace/api-client-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  permissions: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
}

export function RoleDialog({ open, onOpenChange, role }: RoleDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  
  const { data: groupedPermissions } = useListPermissions();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  });

  useEffect(() => {
    if (role && open) {
      form.reset({
        name: role.name,
        description: role.description || "",
        permissions: role.permissions || [],
      });
    } else if (!role && open) {
      form.reset({
        name: "",
        description: "",
        permissions: [],
      });
    }
  }, [role, open, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (role) {
        await updateRole.mutateAsync({
          id: role.id,
          data: values,
        });
        toast({ title: "Success", description: "Role updated successfully" });
      } else {
        await createRole.mutateAsync({
          data: values,
        });
        toast({ title: "Success", description: "Role created successfully" });
      }
      queryClient.invalidateQueries({ queryKey: ["listRoles"] });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save role",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{role ? "Edit Role" : "Create Role"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={role?.isSystem} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Permissions</h3>
              
              {groupedPermissions && Object.entries(groupedPermissions).map(([module, permissions]: [string, any]) => (
                <div key={module} className="space-y-3 border rounded-md p-4">
                  <h4 className="font-semibold text-sm text-muted-foreground">{module}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {permissions.map((perm: any) => (
                      <FormField
                        key={perm.permissionKey}
                        control={form.control}
                        name="permissions"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={perm.permissionKey}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(perm.permissionKey)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, perm.permissionKey])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== perm.permissionKey
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  {perm.permissionName}
                                </FormLabel>
                                {perm.description && (
                                  <p className="text-xs text-muted-foreground">
                                    {perm.description}
                                  </p>
                                )}
                              </div>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createRole.isPending || updateRole.isPending}
              >
                {createRole.isPending || updateRole.isPending ? "Saving..." : "Save Role"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
