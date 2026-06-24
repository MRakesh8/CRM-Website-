import { useState } from "react";
import { useListLeads, getListLeadsQueryKey, useUpdateLead } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { LeadDialog } from "@/components/dialogs/LeadDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Target, DollarSign, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";

const STAGES = [
  { id: "new", label: "New Lead", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300" },
  { id: "contacted", label: "Contacted", color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300" },
  { id: "interested", label: "Interested", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300" },
  { id: "proposal_sent", label: "Proposal Sent", color: "bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-800 dark:text-fuchsia-300" },
  { id: "negotiation", label: "Negotiation", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300" },
  { id: "won", label: "Won", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300" },
  { id: "lost", label: "Lost", color: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300" }
];

export default function Leads() {
  const { data: leads, isLoading } = useListLeads();
  const queryClient = useQueryClient();
  const updateLead = useUpdateLead();
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [sheetLead, setSheetLead] = useState<any>(null);

  const handleDrop = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    const idStr = e.dataTransfer.getData("text/plain");
    if (!idStr) return;
    const id = parseInt(idStr, 10);
    
    // Optimistic update
    const currentLeads = queryClient.getQueryData<any[]>(getListLeadsQueryKey()) || [];
    queryClient.setQueryData(getListLeadsQueryKey(), currentLeads.map(l => l.id === id ? { ...l, stage } : l));

    updateLead.mutate({ id, data: { stage } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() }),
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Error", description: err?.response?.data?.error || "Failed to update lead stage" });
        queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() }); // revert
      }
    });
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData("text/plain", id.toString());
  };

  const handleCreate = () => {
    setEditingLead(null);
    setDialogOpen(true);
  };

  const handleEdit = (lead: any) => {
    setSheetLead(null);
    setEditingLead(lead);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Pipeline</h1>
          <p className="text-muted-foreground mt-1">Track and manage prospective deals through the sales funnel.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" /> Add Lead
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start snap-x snap-mandatory">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-muted/30 rounded-xl p-4 min-w-[320px] w-[320px] border flex flex-col gap-3 shrink-0 snap-start">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ))
        ) : (
          STAGES.map(stageObj => {
            const stageLeads = leads?.filter(l => l.stage === stageObj.id) || [];
            const stageValue = stageLeads.reduce((acc, l) => acc + (l.value || 0), 0);
            
            return (
              <div 
                key={stageObj.id} 
                className="bg-muted/30 rounded-xl p-3 min-w-[320px] w-[320px] border flex flex-col gap-3 shrink-0 snap-start h-full max-h-full overflow-hidden"
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                onDrop={(e) => handleDrop(e, stageObj.id)}
              >
                <div className="flex justify-between items-center mb-1 px-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2.5 h-2.5 rounded-full", stageObj.color.split(' ')[0])}></span>
                    <span className="font-semibold text-sm">{stageObj.label}</span>
                  </div>
                  <span className="bg-background text-muted-foreground px-2 py-0.5 rounded-full text-xs border font-medium">
                    {stageLeads.length}
                  </span>
                </div>
                {stageValue > 0 && (
                  <div className="text-xs text-muted-foreground font-medium px-1 mb-1">
                    Pipeline Value: {formatCurrency(stageValue)}
                  </div>
                )}
                
                <div className="flex-1 overflow-y-auto space-y-3 p-1">
                  {stageLeads.map(lead => (
                    <div 
                      key={lead.id} 
                      draggable 
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onClick={() => setSheetLead(lead)}
                      className="bg-card p-4 rounded-lg border shadow-sm cursor-pointer hover:border-primary/50 hover:shadow-md transition-all active:cursor-grabbing"
                    >
                      <div className="font-semibold mb-1 line-clamp-1">{lead.name}</div>
                      {lead.companyName && <div className="text-xs text-muted-foreground mb-3 line-clamp-1">{lead.companyName}</div>}
                      
                      <div className="flex flex-col gap-2 mt-2 pt-3 border-t">
                        {(lead.value ?? 0) > 0 && (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <DollarSign className="w-3.5 h-3.5" />
                            {formatCurrency(lead.value ?? 0)}
                          </div>
                        )}
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          {lead.assigneeName ? (
                            <div className="flex items-center gap-1.5">
                              <User className="w-3 h-3" /> <span className="line-clamp-1">{lead.assigneeName}</span>
                            </div>
                          ) : <span />}
                          {lead.followUpDate && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3" /> {new Date(lead.followUpDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground text-sm opacity-50 bg-background/50 h-24">
                      Drag leads here
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <LeadDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        lead={editingLead} 
      />

      <Sheet open={!!sheetLead} onOpenChange={(open) => !open && setSheetLead(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {sheetLead && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle className="text-2xl">{sheetLead.name}</SheetTitle>
                {sheetLead.companyName && <SheetDescription className="text-base">{sheetLead.companyName}</SheetDescription>}
              </SheetHeader>
              
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <StatusBadge status={sheetLead.stage} type="lead" />
                  {sheetLead.value > 0 && (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg ml-auto">
                      {formatCurrency(sheetLead.value)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm bg-muted/20 p-4 rounded-lg border">
                  <div>
                    <div className="text-muted-foreground mb-1">Email</div>
                    <div className="font-medium break-words">{sheetLead.email}</div>
                  </div>
                  {sheetLead.phone && (
                    <div>
                      <div className="text-muted-foreground mb-1">Phone</div>
                      <div className="font-medium">{sheetLead.phone}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-muted-foreground mb-1">Assignee</div>
                    <div className="font-medium">{sheetLead.assigneeName || "Unassigned"}</div>
                  </div>
                  {sheetLead.followUpDate && (
                    <div>
                      <div className="text-muted-foreground mb-1">Follow Up</div>
                      <div className="font-medium">{new Date(sheetLead.followUpDate).toLocaleDateString()}</div>
                    </div>
                  )}
                </div>

                {sheetLead.notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Notes</h4>
                    <div className="text-sm bg-muted/20 p-4 rounded-lg border whitespace-pre-wrap">
                      {sheetLead.notes}
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setSheetLead(null)}>Close</Button>
                  <Button onClick={() => handleEdit(sheetLead)}>Edit Lead</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
