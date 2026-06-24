import { useParams, Link } from "wouter";
import { useState } from "react";
import { useGetProject, useListTasks, getListTasksQueryKey, useDeleteTask } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { ArrowLeft, Calendar, DollarSign, Target, Plus, CheckSquare } from "lucide-react";
import { ProjectDialog } from "@/components/dialogs/ProjectDialog";
import { TaskDialog } from "@/components/dialogs/TaskDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function ProjectDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0", 10);
  
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);

  const { data: project, isLoading: projectLoading } = useGetProject(id);
  const { data: tasks, isLoading: tasksLoading } = useListTasks();
  
  const queryClient = useQueryClient();
  const deleteTask = useDeleteTask();
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  const projectTasks = tasks?.filter(t => t.projectId === id) || [];

  const handleCreateTask = () => {
    setEditingTask(null);
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  const handleDeleteTask = () => {
    if (!deleteTaskId) return;
    deleteTask.mutate({ id: deleteTaskId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        toast({ title: "Task deleted" });
        setDeleteTaskId(null);
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Error", description: err?.response?.data?.error || "Failed to delete task" });
        setDeleteTaskId(null);
      }
    });
  };

  if (projectLoading) return <div className="p-8 space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64 w-full" /></div>;
  if (!project) return <div className="p-8 text-center"><p className="text-xl font-medium text-muted-foreground">Project not found</p><Button asChild className="mt-4"><Link href="/projects">Back to Projects</Link></Button></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/projects" className="hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Projects
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <StatusBadge status={project.status} type="project" />
          </div>
          <p className="text-muted-foreground text-lg">
            Client: <Link href={`/clients/${project.clientId}`} className="text-primary hover:underline">{project.clientName}</Link>
          </p>
        </div>
        <Button onClick={() => setProjectDialogOpen(true)} variant="outline">Edit Project</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-border shadow-sm h-full">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{project.description || "No description provided."}</p>
            </div>
            
            <div className="bg-muted/30 p-5 rounded-lg border space-y-4">
              <div className="flex justify-between font-medium">
                <span className="flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Overall Progress</span>
                <span>{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-3 bg-muted" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm h-full">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-full mt-0.5"><DollarSign className="w-4 h-4 text-primary" /></div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Budget</div>
                <div className="text-lg font-semibold">{project.budget ? formatCurrency(project.budget) : "Not set"}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-full mt-0.5"><Calendar className="w-4 h-4 text-primary" /></div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Timeline</div>
                <div className="text-sm font-medium mt-1">
                  Start: {project.startDate ? new Date(project.startDate).toLocaleDateString() : "TBD"}
                </div>
                <div className="text-sm font-medium mt-0.5">
                  End: {project.endDate ? new Date(project.endDate).toLocaleDateString() : "TBD"}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-full mt-0.5"><CheckSquare className="w-4 h-4 text-primary" /></div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Tasks</div>
                <div className="text-lg font-semibold">{projectTasks.length} total</div>
                <div className="text-xs text-muted-foreground">{projectTasks.filter(t => t.status === 'done').length} completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle>Project Tasks</CardTitle>
          <Button size="sm" onClick={handleCreateTask}>
            <Plus className="w-4 h-4 mr-1" /> Add Task
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {tasksLoading ? (
            <div className="p-6"><Skeleton className="h-32 w-full" /></div>
          ) : projectTasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-6">Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectTasks.map(task => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium pl-6">{task.title}</TableCell>
                    <TableCell><StatusBadge status={task.status} type="task" /></TableCell>
                    <TableCell><PriorityBadge priority={task.priority} /></TableCell>
                    <TableCell>{task.assigneeName || "-"}</TableCell>
                    <TableCell className="text-sm">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}>Edit</Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteTaskId(task.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <CheckSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No tasks defined for this project.</p>
              <Button variant="link" onClick={handleCreateTask} className="mt-2 text-primary">Create the first task</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ProjectDialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen} project={project} />
      <TaskDialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen} task={editingTask} defaultProjectId={id} />
      <ConfirmDialog
        open={!!deleteTaskId}
        onOpenChange={(open) => !open && setDeleteTaskId(null)}
        title="Delete Task"
        description="Are you sure you want to delete this task? This cannot be undone."
        onConfirm={handleDeleteTask}
      />
    </div>
  );
}
