import { useListNotifications, getListNotificationsQueryKey, useMarkNotificationRead, useMarkAllNotificationsRead } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Notifications() {
  const { data: notifications, isLoading } = useListNotifications();
  const queryClient = useQueryClient();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const handleMarkRead = (id: number) => {
    markRead.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() })
    });
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() })
    });
  };

  if (isLoading) return <div className="p-8">Loading notifications...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Updates and alerts.</p>
        </div>
        <Button variant="outline" onClick={handleMarkAllRead}>Mark all as read</Button>
      </div>

      <div className="space-y-4">
        {notifications?.map((notification) => (
          <Card key={notification.id} className={cn(!notification.read && "border-primary bg-primary/5")}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className={cn("text-sm", !notification.read && "font-semibold")}>{notification.message}</p>
                <div className="flex gap-2 items-center mt-2">
                  <span className="text-xs text-muted-foreground">{new Date(notification.createdAt).toLocaleString()}</span>
                  <span className="text-xs px-2 py-0.5 bg-secondary rounded capitalize">{notification.type}</span>
                </div>
              </div>
              {!notification.read && (
                <Button variant="ghost" size="sm" onClick={() => handleMarkRead(notification.id)}>Mark Read</Button>
              )}
            </CardContent>
          </Card>
        ))}
        {!notifications?.length && (
          <div className="text-center py-12 text-muted-foreground">No notifications.</div>
        )}
      </div>
    </div>
  );
}
