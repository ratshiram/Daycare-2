import React, { useState, useEffect } from 'react';
import { useAppState } from '@/app/app';
import { InfoMessage } from '../ui/InfoMessage';
import { Icons } from '@/components/Icons';
import type { Child, DailyReport } from '@/types';

const QuickActionItem = ({ icon: Icon, label, onClick }: any) => (
    <button
        className="quick-action-item page-card-item interactive-card"
        onClick={onClick}
        title={`Navigate to ${label}`}>
        <div className="quick-action-header">
            {Icon && <Icon size={24} className="quick-action-icon text-primary" />}
            <span className="quick-action-label">{label}</span>
        </div>
    </button>
);

export const ParentDashboardPage = ({ currentUser }: { currentUser: any }) => {
    const { children, dailyReports, rooms, setCurrentPage } = useAppState();
    const [myChildren, setMyChildren] = useState<Child[]>([]);
    const [reportCounts, setReportCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        if (currentUser?.role === 'parent' && currentUser.profileId && Array.isArray(children)) {
            const filteredChildren = children.filter((c: Child) => c.primary_parent_id === currentUser.profileId);
            setMyChildren(filteredChildren);

            if (Array.isArray(dailyReports) && filteredChildren.length > 0) {
                const counts = filteredChildren.reduce((acc, child) => {
                    acc[child.id] = dailyReports.filter((report: DailyReport) => report.child_id === child.id).length;
                    return acc;
                }, {} as Record<string, number>);
                setReportCounts(counts);
            }
        } else {
            setMyChildren([]);
            setReportCounts({});
        }
    }, [currentUser, children, dailyReports]);

    return (
        <div className="page-card admin-dashboard space-y-8">
            <InfoMessage message={`Welcome, ${currentUser?.name || 'Parent'}!`} icon={Icons.Smile} type="info" />

            <div>
                <h3 className="dashboard-section-title text-2xl font-bold mb-4">Your Children</h3>
                {myChildren.length > 0 ? (
                    <ul className="space-y-4">
                        {myChildren.map(child => {
                            const isCheckedIn = child.check_in_time && !child.check_out_time;
                            const statusText = isCheckedIn ? 'Checked In' : 'Checked Out';
                            const statusClass = isCheckedIn ? 'status-badge-green' : 'status-badge-red';
                            const room = rooms?.find((r: any) => r.id === child.current_room_id);

                            return (
                                <li key={child.id} className="content-list-item page-card-item p-4">
                                    <div className="flex justify-between items-center flex-wrap gap-2">
                                        <span className='font-semibold text-lg'>{child.name} (Age: {child.age || 'N/A'})</span>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className={`status-badge ${statusClass}`}>
                                                {isCheckedIn ? <Icons.LogIn size={14} className="mr-1" /> : <Icons.LogOut size={14} className="mr-1" />}
                                                {statusText}
                                            </span>
                                            <span className="status-badge status-badge-blue">
                                                <Icons.BookCopy size={14} className="mr-1" />
                                                {reportCounts[child.id] || 0} Reports
                                            </span>
                                        </div>
                                    </div>
                                    {room && <p className="text-sm text-muted-foreground mt-1">Room: {room.name}</p>}
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p>No children linked to your profile. Please contact administration if this is an error.</p>
                )}
            </div>

            <div>
                <h2 className="dashboard-section-title text-2xl font-bold mb-4">Quick Access</h2>
                <div className="quick-actions-grid">
                    <QuickActionItem icon={Icons.FileText} label="View Daily Reports" onClick={() => setCurrentPage('ParentDailyReports')} />
                    <QuickActionItem icon={Icons.DollarSign} label="View Invoices" onClick={() => setCurrentPage('ParentInvoices')} />
                    <QuickActionItem icon={Icons.Camera} label="Photo Gallery" onClick={() => setCurrentPage('AdminGallery')} />
                    <QuickActionItem icon={Icons.Megaphone} label="Announcements" onClick={() => setCurrentPage('AdminAnnouncements')} />
                </div>
            </div>
        </div>
    );
};
