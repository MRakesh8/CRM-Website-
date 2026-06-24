import { useState } from "react";
import { useListTasks, getListTasksQueryKey, useUpdateTask, useDeleteTask } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskDialog } from "@/components/dialogs/TaskDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { Plus, Kanban, List, Calendar, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const STATUSES = [
  { id: "todo", label: "To Do", bg: "bg-slate-100 dark:bg-slate-900/30" },
  { id: "in_progress", label: "In Progress", bg: "bg-blue-50 dark:bg-blue-900/10 border-t-2 border-blue-400" },
  { id: "review", label: "Review", bg: "bg-amber-50 dark:bg-amber-900/10 border-t-2 border-amber-400" },
  { id: "done", label: "Done", bg: "bg-emerald-50 dark:bg-emerald-900/10 border-t-2 border-emerald-400" }
];

export default function Tasks() {
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: tasks, isLoading } = useListTasks();
  const queryClient = useQueryClient();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { toast } = useToast();

  const handleCreate = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteTask.mutate({ id: deleteId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        toast({ title: "Task deleted successfully" });
        setDeleteId(null);
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Error", description: err?.response?.data?.error || "Failed to delete task" });
        setDeleteId(null);
      }
    });
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const idStr = e.dataTransfer.getData("text/plain");
    if (!idStr) return;
    const id = parseInt(idStr, 10);
    
    // Optimistic update
    const currentTasks = queryClient.getQueryData<any[]>(getListTasksQueryKey()) || [];
    queryClient.setQueryData(getListTasksQueryKey(), currentTasks.map(t => t.id === id ? { ...t, status } : t));

    updateTask.mutate({ id, data: { status } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() }),
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Error", description: err?.response?.data?.error || "Failed to update task status" });
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() }); // revert
      }
    });
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData("text/plain", id.toString());
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage project execution and daily to-dos.</p>
        </div>
        <div className="flex items-center gap-4">
          <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as any)} className="bg-background border rounded-md">
            <ToggleGroupItem value="kanban" aria-label="Kanban View" className="px-3">
              <Kanban className="h-4 w-4 mr-2" /> Kanban
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Table View" className="px-3">
              <List className="h-4 w-4 mr-2" /> Table
            </ToggleGroupItem>
          </ToggleGroup>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" /> Add Task
          </Button>
        </div>
      </div>

      {view === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-muted/30 rounded-xl p-4 min-w-[300px] w-[300px] border flex flex-col gap-3">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ))
          ) : (
            STATUSES.map(statusObj => {
              const statusTasks = tasks?.filter(t => t.status === statusObj.id) || [];
              
              return (
                <div 
                  key={statusObj.id} 
                  className={cn("rounded-xl p-3 min-w-[320px] w-[320px] border flex flex-col gap-3 shrink-0 h-full max-h-full overflow-hidden", statusObj.bg)}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                  onDrop={(e) => handleDrop(e, statusObj.id)}
                >
                  <div className="flex justify-between items-center mb-1 px-1">
                    <span className="font-semibold text-sm uppercase tracking-wider">{statusObj.label}</span>
                    <span className="bg-background text-muted-foreground px-2 py-0.5 rounded-full text-xs border font-medium">
                      {statusTasks.length}
                    </span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-3 p-1">
                    {statusTasks.map(task => (
                      <Card 
                        key={task.id} 
                        draggable 
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => handleEdit(task)}
                        className={cn(
                          "cursor-pointer hover:border-primary/50 transition-all active:cursor-grabbing border shadow-sm",
                          task.priority === 'urgent' && "border-l-4 border-l-red-500"
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="font-semibold mb-1 line-clamp-2 leading-snug">{task.title}</div>
                          <div className="text-xs font-medium text-primary mb-3">
                            <Link href={`/projects/${task.projectId}`} onClick={e => e.stopPropagation()} className="hover:underline">
                              {task.projectName || "No Project"}
                            </Link>
                          </div>
                          
                          <div className="flex justify-between items-center mt-auto pt-3 border-t">
                            <PriorityBadge priority={task.priority} />
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              {task.dueDate ? (
                                <>
                                  <Calendar className="w-3 h-3" />
                                  <span className={cn(new Date(task.dueDate) < new Date() && task.status !== 'done' && "text-red-500 font-medium")}>
                                    {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                  </span>
                                </>
                              ) : <span />}
                            </div>
                          </div>
                          {task.assigneeName && (
                            <div className="mt-3 text-xs text-muted-foreground flex justify-end">
                              {task.assigneeName}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {statusTasks.length === 0 && (
                      <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground text-sm opacity-50 bg-background/50 h-24">
                        Drag tasks here
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="border rounded-md bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="pl-6">Title</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : tasks && tasks.length > 0 ? (
                tasks.map(task => (
                  <TableRow key={task.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium pl-6">
                      <button onClick={() => handleEdit(task)} className="text-left hover:underline text-foreground">
                        {task.title}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Link href={`/projects/${task.projectId}`} className="text-primary hover:underline">
                        {task.projectName || "-"}
                      </Link>
                    </TableCell>
                    <TableCell>{task.assigneeName || "-"}</TableCell>
                    <TableCell><PriorityBadge priority={task.priority} /></TableCell>
                    <TableCell className={cn("text-sm", task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done' && "text-red-500 font-medium")}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell><StatusBadge status={task.status} type="task" /></TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(task)}>Edit</Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteId(task.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <AlertCircle className="w-10 h-10 mb-3 text-muted-foreground/50" />
                      <p className="text-lg font-medium">No tasks found</p>
                      <Button variant="link" onClick={handleCreate} className="mt-2 text-primary">Create the first task</Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <TaskDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        task={editingTask} 
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Task"
        description="Are you sure you want to delete this task?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
