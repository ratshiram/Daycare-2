
import React, { useEffect, useState } from 'react';
import { useAppState } from '@/app/app';
import { InfoMessage } from '../ui/InfoMessage';
import { Icons } from '@/components/Icons';
import type { Child, Room } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const TeacherDashboardPage = () => {
    const { currentUser, staff, rooms, children, setCurrentPage } = useAppState();
    const [teacherRoom, setTeacherRoom] = useState<Room | null>(null);
    const [roomChildren, setRoomChildren] = useState<Child[]>([]);

    useEffect(() => {
        if (currentUser?.staff_id && Array.isArray(staff) && Array.isArray(rooms) && Array.isArray(children)) {
            const teacherProfile = staff.find(s => s.id === currentUser.staff_id);
            if (teacherProfile?.main_room_id) {
                const foundRoom = rooms.find(r => r.id === teacherProfile.main_room_id);
                setTeacherRoom(foundRoom || null);
                if (foundRoom) {
                    const childrenInRoom = children.filter(c => c.current_room_id === foundRoom.id);
                    setRoomChildren(childrenInRoom);
                }
            }
        }
    }, [currentUser, staff, rooms, children]);

    const checkedInChildren = roomChildren.filter(c => c.check_in_time && !c.check_out_time);

    return (
        <div className="space-y-6">
            <InfoMessage icon={Icons.Briefcase} message={`Welcome, ${currentUser?.name || 'Teacher'}!`} type="info" />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Your Main Room</CardTitle>
                        <Icons.Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{teacherRoom?.name || 'Not Assigned'}</div>
                        <p className="text-xs text-muted-foreground">Capacity: {teacherRoom?.capacity || 'N/A'}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Children in Room</CardTitle>
                        <Icons.UsersIconAliased className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{roomChildren.length}</div>
                        <p className="text-xs text-muted-foreground">Total children assigned</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Currently Checked In</CardTitle>
                        <Icons.CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{checkedInChildren.length}</div>
                        <p className="text-xs text-muted-foreground">of {roomChildren.length} children</p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button onClick={() => setCurrentPage('AdminDailyReports')} variant="outline" className="justify-start text-left h-auto py-2"><Icons.FileText className="mr-2"/>View & Create Daily Reports</Button>
                        <Button onClick={() => setCurrentPage('AdminGallery')} variant="outline" className="justify-start text-left h-auto py-2"><Icons.Camera className="mr-2"/>Photo Gallery</Button>
                        <Button onClick={() => setCurrentPage('AdminAnnouncements')} variant="outline" className="justify-start text-left h-auto py-2"><Icons.Megaphone className="mr-2"/>View Announcements</Button>
                        <Button onClick={() => setCurrentPage('AdminIncidentReports')} variant="outline" className="justify-start text-left h-auto py-2"><Icons.ShieldAlert className="mr-2"/>Log an Incident</Button>
                        <Button onClick={() => setCurrentPage('StaffLeaveRequests')} variant="outline" className="justify-start text-left h-auto py-2"><Icons.Plane className="mr-2"/>Request Time Off</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Checked-in Children</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {checkedInChildren.length > 0 ? (
                            <ul className="space-y-2">
                                {checkedInChildren.map(child => (
                                    <li key={child.id} className="flex items-center justify-between text-sm">
                                        <span>{child.name}</span>
                                        {child.check_in_time && <span className="text-muted-foreground text-xs">Checked in at {new Date(child.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No children are currently checked in to your room.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

    