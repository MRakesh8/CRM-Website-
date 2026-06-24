import { useListNotifications, getListNotificationsQueryKey, useMarkNotificationRead, useMarkAllNotificationsRead } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Target, DollarSign, Briefcase, CheckSquare, MessageSquare, Bell, CheckCircle2 } from "lucide-react";

export default function Notifications() {
  const { data: notifications, isLoading } = useListNotifications();
  const queryClient = useQueryClient();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const handleMarkRead = (id: number) => {
    // Optimistic update
    const currentNotifs = queryClient.getQueryData<any[]>(getListNotificationsQueryKey()) || [];
    queryClient.setQueryData(getListNotificationsQueryKey(), currentNotifs.map(n => n.id === id ? { ...n, read: true } : n));

    markRead.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() })
    });
  };

  const handleMarkAllRead = () => {
    // Optimistic update
    const currentNotifs = queryClient.getQueryData<any[]>(getListNotificationsQueryKey()) || [];
    queryClient.setQueryData(getListNotificationsQueryKey(), currentNotifs.map(n => ({ ...n, read: true })));

    markAllRead.mutate(undefined, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() })
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lead': return <Target className="w-5 h-5 text-indigo-500" />;
      case 'invoice': return <DollarSign className="w-5 h-5 text-emerald-500" />;
      case 'project': return <Briefcase className="w-5 h-5 text-blue-500" />;
      case 'task': return <CheckSquare className="w-5 h-5 text-amber-500" />;
      case 'ticket': return <MessageSquare className="w-5 h-5 text-purple-500" />;
      default: return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return "just now";
  };

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-1">Stay updated on your workspace activities.</p>
        </div>
        {notifications && notifications.length > 0 && unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllRead} disabled={markAllRead.isPending}>
            <CheckCircle2 className="w-4 h-4 mr-2" /> Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="border-border shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={cn(
                "border-border shadow-sm transition-all overflow-hidden relative",
                !notification.read ? "bg-primary/5 border-primary/20" : "bg-card"
              )}
            >
              {!notification.read && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
              )}
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className={cn(
                  "p-3 rounded-full shrink-0",
                  !notification.read ? "bg-primary/10" : "bg-muted"
                )}>
                  {getTypeIcon(notification.type)}
                </div>
                
                <div className="flex-1">
                  <p className={cn("text-base leading-snug", !notification.read ? "font-semibold text-foreground" : "text-muted-foreground")}>
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs font-medium text-muted-foreground">
                    <span className="capitalize">{notification.type}</span>
                    <span>•</span>
                    <span>{getTimeAgo(notification.createdAt)}</span>
                  </div>
                </div>
                
                {!notification.read && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="shrink-0 mt-2 sm:mt-0 text-primary hover:text-primary hover:bg-primary/10" 
                    onClick={() => handleMarkRead(notification.id)}
                  >
                    Mark read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-xl bg-card">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <Bell className="w-12 h-12 mb-4 text-muted-foreground/30" />
              <p className="text-xl font-medium">All caught up!</p>
              <p className="text-sm mt-1">You don't have any notifications right now.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
