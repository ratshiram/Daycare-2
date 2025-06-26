
"use client";

import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/Icons';
import { useAppState } from '@/app/app';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export const NotificationsPopover = () => {
    const { notifications, markNotificationAsRead, markAllNotificationsAsRead, setCurrentPage } = useAppState();

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleNotificationClick = (notificationId: string, link?: string | null) => {
        markNotificationAsRead(notificationId);
        if (link) {
            setCurrentPage(link);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Icons.Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                         <Button variant="link" size="sm" onClick={markAllNotificationsAsRead}>
                            Mark all as read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length > 0 ? (
                        notifications.map(notification => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification.id, notification.link)}
                                className={cn(
                                    "p-4 border-b last:border-b-0 hover:bg-accent cursor-pointer",
                                    !notification.is_read && "bg-blue-50"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    {!notification.is_read && <div className="mt-1 h-2 w-2 rounded-full bg-primary" />}
                                    <div className="flex-1">
                                        <p className="font-semibold">{notification.title}</p>
                                        <p className="text-sm text-muted-foreground">{notification.body}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-muted-foreground">
                            <Icons.Bell size={32} className="mx-auto mb-2" />
                            <p>You have no notifications.</p>
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};
