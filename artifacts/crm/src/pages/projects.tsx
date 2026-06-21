import { useListProjects, getListProjectsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";

export default function Projects() {
  const { data: projects, isLoading } = useListProjects();

  if (isLoading) return <div className="p-8">Loading projects...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage ongoing and past projects.</p>
        </div>
        <Button>Create Project</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects?.map(project => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle className="flex justify-between">
                <Link href={`/projects/${project.id}`} className="hover:underline">
                  {project.name}
                </Link>
                <span className="text-xs font-normal px-2 py-1 bg-secondary rounded uppercase">{project.status}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} />
              </div>
              <div className="mt-4 text-sm flex justify-between">
                <span className="text-muted-foreground">Client: {project.clientName}</span>
                {project.budget && <span className="font-medium">${project.budget.toLocaleString()}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
