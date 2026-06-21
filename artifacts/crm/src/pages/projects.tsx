import { useState } from "react";
import { useListProjects, getListProjectsQueryKey, useDeleteProject } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectDialog } from "@/components/dialogs/ProjectDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Briefcase, Calendar, Edit2, Trash2 } from "lucide-react";

export default function Projects() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: projects, isLoading } = useListProjects();
  const queryClient = useQueryClient();
  const deleteProject = useDeleteProject();
  const { toast } = useToast();

  const filteredProjects = projects?.filter(p => statusFilter === "all" || p.status === statusFilter) || [];

  const handleCreate = () => {
    setEditingProject(null);
    setDialogOpen(true);
  };

  const handleEdit = (e: React.MouseEvent, project: any) => {
    e.preventDefault(); // prevent link navigation
    setEditingProject(project);
    setDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    setDeleteId(id);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteProject.mutate({ id: deleteId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        toast({ title: "Project deleted successfully" });
        setDeleteId(null);
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Error", description: err?.response?.data?.error || "Failed to delete project" });
        setDeleteId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage deliverables and track progress.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" /> Create Project
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="flex flex-col border-border shadow-sm h-[240px]">
              <CardHeader className="pb-3"><Skeleton className="h-6 w-3/4 mb-2" /><Skeleton className="h-4 w-1/4" /></CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-5/6" /></div>
                <div><Skeleton className="h-2 w-full mt-4" /></div>
              </CardContent>
            </Card>
          ))
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map(project => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="flex flex-col border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all h-full cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">{project.name}</CardTitle>
                    <StatusBadge status={project.status} type="project" />
                  </div>
                  <div className="text-sm font-medium text-muted-foreground mt-1">{project.clientName}</div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                      {project.description || "No description provided."}
                    </p>
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      {project.endDate ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> 
                          {new Date(project.endDate).toLocaleDateString()}
                        </div>
                      ) : <span>No deadline</span>}
                      {project.budget && <div className="font-medium text-foreground">${project.budget.toLocaleString()}</div>}
                    </div>
                  </div>
                  
                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2 bg-muted" />
                  </div>

                  <div className="mt-4 pt-4 border-t flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" onClick={(e) => handleEdit(e, project)}>
                      <Edit2 className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={(e) => handleDeleteClick(e, project.id)}>
                      <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-16 border-2 border-dashed rounded-xl bg-card">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <Briefcase className="w-12 h-12 mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium">No projects found</p>
              <p className="text-sm mb-4">You haven't created any projects matching this criteria.</p>
              <Button onClick={handleCreate}>Create Project</Button>
            </div>
          </div>
        )}
      </div>

      <ProjectDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        project={editingProject} 
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Project"
        description="Are you sure you want to delete this project? All associated tasks will also be removed. This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  );
}
