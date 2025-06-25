
import React, { useState, useEffect } from 'react';
import { useAppState } from '@/app/app';
import { InfoMessage } from '../ui/InfoMessage';
import { Icons } from '@/components/Icons';
import type { Child, DailyReport, Announcement } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatDateForInput } from '@/lib/customUtils';
import { Button } from '@/components/ui/button';

export const ParentDashboardPage = ({ currentUser }: { currentUser: any }) => {
    const { children, dailyReports, announcements, setCurrentPage } = useAppState();
    const [myChildren, setMyChildren] = useState<Child[]>([]);
    const [latestReport, setLatestReport] = useState<DailyReport | null>(null);
    const [latestAnnouncement, setLatestAnnouncement] = useState<Announcement | null>(null);

    useEffect(() => {
        if (currentUser?.role === 'parent' && currentUser.profileId && Array.isArray(children)) {
            const filteredChildren = children.filter((c: Child) => 
                c.primary_parent_id === currentUser.profileId || c.parent_2_id === currentUser.profileId
            );
            setMyChildren(filteredChildren);

            if (filteredChildren.length > 0) {
                const childrenIds = filteredChildren.map(c => c.id);
                
                if (Array.isArray(dailyReports)) {
                    const reportsForMyChildren = dailyReports
                        .filter(r => childrenIds.includes(r.child_id))
                        .sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime());
                    setLatestReport(reportsForMyChildren[0] || null);
                }

                if (Array.isArray(announcements)) {
                    const publishedAnnouncements = announcements
                        .filter(a => a.is_published)
                        .sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime());
                    setLatestAnnouncement(publishedAnnouncements[0] || null);
                }
            }
        }
    }, [currentUser, children, dailyReports, announcements]);

    const childNameMap = Array.isArray(children) ? children.reduce((acc, child) => {
        acc[child.id] = child.name;
        return acc;
    }, {} as Record<string, string>) : {};

    return (
        <div className="space-y-6">
            <InfoMessage message={`Welcome, ${currentUser?.name || 'Parent'}!`} icon={Icons.Smile} type="info" />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-full md:col-span-1 lg:col-span-1">
                    <CardHeader>
                        <CardTitle>My Children</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {myChildren.length > 0 ? (
                            myChildren.map(child => {
                                const isCheckedIn = child.check_in_time && !child.check_out_time;
                                return (
                                    <div key={child.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                                        <div className="font-semibold">{child.name}</div>
                                        <span className={`status-badge ${isCheckedIn ? 'status-badge-green' : 'status-badge-red'}`}>{isCheckedIn ? 'Checked In' : 'Checked Out'}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-muted-foreground">No children linked to your profile.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-full md:col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Latest Updates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {latestReport ? (
                            <div className="p-3 border rounded-lg">
                                <p className="text-sm font-semibold text-primary">Latest Daily Report</p>
                                <p className="text-sm">{`A new report for ${childNameMap[latestReport.child_id]} on ${formatDateForInput(latestReport.report_date)} is available.`}</p>
                                <Button variant="link" className="p-0 h-auto" onClick={() => setCurrentPage('ParentDailyReports')}>View Reports</Button>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No new daily reports.</p>
                        )}
                        {latestAnnouncement ? (
                             <div className="p-3 border rounded-lg">
                                <p className="text-sm font-semibold text-primary">New Announcement</p>
                                <p className="text-sm font-bold">{latestAnnouncement.title}</p>
                                <p className="text-sm text-muted-foreground truncate">{latestAnnouncement.content}</p>
                                <Button variant="link" className="p-0 h-auto" onClick={() => setCurrentPage('AdminAnnouncements')}>Read More</Button>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No new announcements.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Quick Access</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" onClick={() => setCurrentPage('ParentDailyReports')}><Icons.FileText className="mr-2"/>Daily Reports</Button>
                    <Button variant="outline" onClick={() => setCurrentPage('ParentInvoices')}><Icons.DollarSign className="mr-2"/>Invoices</Button>
                    <Button variant="outline" onClick={() => setCurrentPage('AdminGallery')}><Icons.Camera className="mr-2"/>Photo Gallery</Button>
                    <Button variant="outline" onClick={() => setCurrentPage('AdminAnnouncements')}><Icons.Megaphone className="mr-2"/>Announcements</Button>
                </CardContent>
            </Card>
        </div>
    );
};

    