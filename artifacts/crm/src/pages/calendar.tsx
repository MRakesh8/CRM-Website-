import { useListEvents, getListEventsQueryKey, useDeleteEvent } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { EventDialog } from "@/components/dialogs/EventDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: events, isLoading } = useListEvents();
  const queryClient = useQueryClient();
  const deleteEvent = useDeleteEvent();
  const { toast } = useToast();

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getEventsForDay = (day: number) => {
    if (!events) return [];
    // Compare YYYY-MM-DD
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return events.filter(e => e.startDate.startsWith(dateStr));
  };

  const getEventColor = (type: string) => {
    switch(type) {
      case 'meeting': return 'bg-blue-100 text-blue-800 border-l-2 border-blue-500 dark:bg-blue-900/30 dark:text-blue-300';
      case 'followup': return 'bg-amber-100 text-amber-800 border-l-2 border-amber-500 dark:bg-amber-900/30 dark:text-amber-300';
      case 'deadline': return 'bg-red-100 text-red-800 border-l-2 border-red-500 dark:bg-red-900/30 dark:text-red-300';
      case 'invoice_due': return 'bg-purple-100 text-purple-800 border-l-2 border-purple-500 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-l-2 border-gray-500 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const handleDayClick = (day: number) => {
    setSelectedDate(new Date(year, month, day, 9, 0, 0));
    setEditingEvent(null);
    setDialogOpen(true);
  };

  const handleEventClick = (e: React.MouseEvent, event: any) => {
    e.stopPropagation();
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteEvent.mutate({ id: deleteId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
        toast({ title: "Event deleted successfully" });
        setDeleteId(null);
        setDialogOpen(false);
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Error", description: err?.response?.data?.error || "Failed to delete event" });
        setDeleteId(null);
      }
    });
  };

  const today = new Date();

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1">Manage schedules, meetings, and deadlines.</p>
        </div>
        <Button onClick={() => { setSelectedDate(new Date()); setEditingEvent(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Event
        </Button>
      </div>

      <div className="flex items-center justify-between bg-card p-4 rounded-t-xl border border-b-0 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-primary">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <Button variant="outline" size="sm" onClick={goToday}>Today</Button>
        </div>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={prevMonth} className="h-9 w-9">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} className="h-9 w-9">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="border rounded-b-xl overflow-hidden flex-1 flex flex-col bg-card shadow-sm">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b bg-muted/20 shrink-0">
          {DAYS.map((day, i) => (
            <div key={day} className="p-3 text-center text-sm font-semibold text-muted-foreground">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{SHORT_DAYS[i]}</span>
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {blanks.map(blank => (
            <div key={`blank-${blank}`} className="border-r border-b min-h-[120px] bg-muted/5 p-2" />
          ))}
          {days.map(day => {
            const dayEvents = getEventsForDay(day);
            const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
            
            return (
              <div 
                key={day} 
                className={cn(
                  "border-r border-b min-h-[120px] p-2 hover:bg-muted/30 transition-colors cursor-pointer flex flex-col group", 
                  isToday && "bg-primary/5 hover:bg-primary/10"
                )}
                onClick={() => handleDayClick(day)}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className={cn(
                    "font-bold text-sm w-7 h-7 flex items-center justify-center rounded-full transition-colors", 
                    isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}>
                    {day}
                  </div>
                  <Plus className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="space-y-1.5 flex-1 overflow-y-auto no-scrollbar pb-1">
                  {!isLoading && dayEvents.map(event => (
                    <div 
                      key={event.id} 
                      className={cn(
                        "text-xs px-2 py-1 rounded shadow-sm truncate cursor-pointer transition-all hover:brightness-95", 
                        getEventColor(event.type)
                      )}
                      title={event.title}
                      onClick={(e) => handleEventClick(e, event)}
                    >
                      <div className="font-semibold truncate">{event.title}</div>
                      <div className="text-[10px] opacity-80 truncate">
                        {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <EventDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        event={editingEvent} 
        defaultDate={selectedDate}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Event"
        description="Are you sure you want to delete this event?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
