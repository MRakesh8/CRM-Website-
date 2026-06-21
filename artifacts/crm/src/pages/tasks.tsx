import { useListTasks, getListTasksQueryKey, useUpdateTask } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STATUSES = ["todo", "in_progress", "review", "done"];

export default function Tasks() {
  const { data: tasks, isLoading } = useListTasks();
  const queryClient = useQueryClient();
  const updateTask = useUpdateTask();

  if (isLoading) return <div className="p-8">Loading tasks...</div>;

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const idStr = e.dataTransfer.getData("text/plain");
    if (!idStr) return;
    const id = parseInt(idStr, 10);
    
    updateTask.mutate({ id, data: { status } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() })
    });
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData("text/plain", id.toString());
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage project tasks and assignments.</p>
        </div>
        <Button>Add Task</Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
        {STATUSES.map(status => {
          const statusTasks = tasks?.filter(t => t.status === status) || [];
          return (
            <div 
              key={status} 
              className="bg-muted/30 rounded-lg p-4 min-w-[300px] flex flex-col gap-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="flex justify-between items-center font-medium mb-2 capitalize text-sm">
                <span>{status.replace('_', ' ')}</span>
                <span className="bg-muted px-2 py-0.5 rounded text-xs">{statusTasks.length}</span>
              </div>
              
              {statusTasks.map(task => (
                <Card 
                  key={task.id} 
                  draggable 
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  className="cursor-move hover:border-primary/50 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="font-semibold">{task.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2 mt-1">{task.description}</div>
                    <div className="flex justify-between mt-3 text-xs">
                      <span className="px-2 py-1 bg-secondary rounded uppercase">{task.priority}</span>
                      <span className="text-muted-foreground">{task.projectName}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
