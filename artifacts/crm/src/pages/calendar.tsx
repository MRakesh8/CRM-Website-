import { useListEvents } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Basic query, no date filtering for now just to show events
  const { data: events, isLoading } = useListEvents();

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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getEventsForDay = (day: number) => {
    if (!events) return [];
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return events.filter(e => e.startDate.startsWith(dateStr));
  };

  const getEventColor = (type: string) => {
    switch(type) {
      case 'meeting': return 'bg-blue-500 text-white';
      case 'followup': return 'bg-yellow-500 text-white';
      case 'deadline': return 'bg-red-500 text-white';
      case 'invoice_due': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (isLoading) return <div className="p-8">Loading calendar...</div>;

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1">Schedule and deadlines.</p>
        </div>
        <Button>Add Event</Button>
      </div>

      <div className="flex items-center justify-between mb-4 bg-card p-4 rounded-lg border">
        <h2 className="text-xl font-semibold">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden flex-1 flex flex-col bg-card">
        <div className="grid grid-cols-7 border-b bg-muted/30">
          {DAYS.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {blanks.map(blank => (
            <div key={`blank-${blank}`} className="border-r border-b min-h-[120px] bg-muted/10 p-2" />
          ))}
          {days.map(day => {
            const dayEvents = getEventsForDay(day);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            
            return (
              <div key={day} className={cn("border-r border-b min-h-[120px] p-2 hover:bg-muted/10 transition-colors", isToday && "bg-primary/5")}>
                <div className={cn("font-medium text-sm w-7 h-7 flex items-center justify-center rounded-full mb-1", isToday && "bg-primary text-primary-foreground")}>
                  {day}
                </div>
                <div className="space-y-1 overflow-y-auto max-h-[80px]">
                  {dayEvents.map(event => (
                    <div 
                      key={event.id} 
                      className={cn("text-xs px-1.5 py-0.5 rounded truncate", getEventColor(event.type))}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
