import { useListLeads, getListLeadsQueryKey, useUpdateLead } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STAGES = ["new", "contacted", "interested", "proposal_sent", "negotiation", "won", "lost"];

export default function Leads() {
  const { data: leads, isLoading } = useListLeads();
  const queryClient = useQueryClient();
  const updateLead = useUpdateLead();

  if (isLoading) return <div className="p-8">Loading leads...</div>;

  const handleDrop = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    const idStr = e.dataTransfer.getData("text/plain");
    if (!idStr) return;
    const id = parseInt(idStr, 10);
    
    updateLead.mutate({ id, data: { stage } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() })
    });
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData("text/plain", id.toString());
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Pipeline</h1>
          <p className="text-muted-foreground mt-1">Track and manage prospective deals.</p>
        </div>
        <Button>Add Lead</Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
        {STAGES.map(stage => {
          const stageLeads = leads?.filter(l => l.stage === stage) || [];
          return (
            <div 
              key={stage} 
              className="bg-muted/30 rounded-lg p-4 min-w-[300px] flex flex-col gap-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className="flex justify-between items-center font-medium mb-2 capitalize text-sm">
                <span>{stage.replace('_', ' ')}</span>
                <span className="bg-muted px-2 py-0.5 rounded text-xs">{stageLeads.length}</span>
              </div>
              
              {stageLeads.map(lead => (
                <Card 
                  key={lead.id} 
                  draggable 
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  className="cursor-move hover:border-primary/50 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="font-semibold">{lead.name}</div>
                    <div className="text-sm text-muted-foreground">{lead.companyName}</div>
                    {lead.value && <div className="text-sm font-medium mt-2">${lead.value.toLocaleString()}</div>}
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
