
import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppState } from '@/app/app';
import { InfoMessage } from '../ui/InfoMessage';
import { Icons } from '@/components/Icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';

const StatCard = ({ icon: Icon, value, label, color, targetPage, setCurrentPage }: any) => (
    <Card className="hover:bg-accent hover:shadow-md transition-all cursor-pointer" onClick={targetPage && setCurrentPage ? () => setCurrentPage(targetPage) : undefined}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            {Icon && <Icon size={20} className={`text-muted-foreground ${color}`} />}
        </CardHeader>
        <CardContent>
            <div className={`text-2xl font-bold ${color || 'text-foreground'}`}>{value}</div>
        </CardContent>
    </Card>
);

export const AdminDashboardPage = () => {
    const { currentUser, children, staff, rooms, incidentReports, invoices, waitlistEntries, setCurrentPage } = useAppState();

    const totalChildren = children?.length || 0;
    const totalStaff = staff?.length || 0;
    const totalRooms = rooms?.length || 0;
    const openIncidents = incidentReports?.filter((ir: any) => ir.status?.toLowerCase() === 'open').length || 0;
    const unpaidInvoicesCount = invoices?.filter((inv: any) => ['unpaid', 'overdue'].includes(inv.status?.toLowerCase())).length || 0;
    const waitlistCount = waitlistEntries?.length || 0;

    const childrenByRoomData = Array.isArray(rooms) ? rooms.map(room => ({
        room: room.name,
        children: Array.isArray(children) ? children.filter(c => c.current_room_id === room.id).length : 0,
    })).filter(d => d.children > 0) : [];

    const chartConfig: ChartConfig = {
        children: {
            label: 'Children',
            color: 'hsl(var(--primary))',
        },
    };

    return (
        <div className="space-y-6">
            <InfoMessage icon={Icons.HomeIcon} message={`Welcome back, ${currentUser?.name || 'Admin'}!`} type="info" />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <StatCard icon={Icons.Smile} value={totalChildren} label="Total Children" setCurrentPage={setCurrentPage} targetPage="Children" />
                <StatCard icon={Icons.UsersIconAliased} value={totalStaff} label="Total Staff" setCurrentPage={setCurrentPage} targetPage="Staff" />
                <StatCard icon={Icons.Building} value={totalRooms} label="Total Rooms" setCurrentPage={setCurrentPage} targetPage="Rooms" />
                <StatCard icon={Icons.ShieldAlert} value={openIncidents} label="Open Incidents" color="text-destructive" setCurrentPage={setCurrentPage} targetPage="AdminIncidentReports" />
                <StatCard icon={Icons.DollarSign} value={unpaidInvoicesCount} label="Unpaid Invoices" color="text-orange-500" setCurrentPage={setCurrentPage} targetPage="AdminBilling" />
                <StatCard icon={Icons.ListOrdered} value={waitlistCount} label="On Waitlist" setCurrentPage={setCurrentPage} targetPage="AdminWaitlist" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-full lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Children Distribution by Room</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {childrenByRoomData && childrenByRoomData.length > 0 ? (
                            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                <ResponsiveContainer>
                                    <BarChart data={childrenByRoomData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="room" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            cursor={false}
                                            content={<ChartTooltipContent indicator="dot" />}
                                        />
                                        <Bar dataKey="children" fill="var(--color-children)" radius={4} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        ) : (
                             <InfoMessage message="No children are currently assigned to rooms." icon={Icons.BookCopy} />
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-full lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                         <Button onClick={() => setCurrentPage('Children')} variant="outline" className="justify-start"><Icons.Smile className="mr-2"/>Manage Children</Button>
                         <Button onClick={() => setCurrentPage('Staff')} variant="outline" className="justify-start"><Icons.UsersIconAliased className="mr-2"/>Manage Staff</Button>
                         <Button onClick={() => setCurrentPage('AdminDailyReports')} variant="outline" className="justify-start"><Icons.FileText className="mr-2"/>Daily Reports</Button>
                         <Button onClick={() => setCurrentPage('AdminAnnouncements')} variant="outline" className="justify-start"><Icons.Megaphone className="mr-2"/>Announcements</Button>
                         <Button onClick={() => setCurrentPage('AdminBilling')} variant="outline" className="justify-start"><Icons.DollarSign className="mr-2"/>Billing</Button>
                         <Button onClick={() => setCurrentPage('AdminIncidentReports')} variant="outline" className="justify-start"><Icons.ShieldAlert className="mr-2"/>Log Incident</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
