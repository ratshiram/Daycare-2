import React from 'react';
import { useAppState } from '@/app/app';
import { InfoMessage } from '../ui/InfoMessage';
import { Icons } from '@/components/Icons';

const StatCardItem = ({ icon: Icon, value, label, color, targetPage, setCurrentPage }: any) => (
    <button
        className={`stat-card-item page-card-item interactive-card ${targetPage ? 'cursor-pointer' : ''}`}
        onClick={targetPage && setCurrentPage ? () => setCurrentPage(targetPage) : undefined}
        title={targetPage ? `Go to ${label}` : `${value} ${label}`}>
        {Icon && <Icon size={28} className={`stat-icon ${color || 'text-primary'}`} />}
        <div className={`stat-value ${color || 'text-primary'}`}>{value}</div>
        <div className="stat-label">{label}</div>
    </button>
);

const QuickActionItem = ({ icon: Icon, label, count, subtext, onClick, pageName }: any) => (
    <button
        className="quick-action-item page-card-item interactive-card"
        onClick={onClick}
        title={`Navigate to ${label}`}>
        <div className="quick-action-header">
            {Icon && <Icon size={24} className="quick-action-icon text-primary" />}
            <span className="quick-action-label">{label}</span>
        </div>
        {(typeof count !== 'undefined') && (
            <div className="quick-action-count">
                {count}
                {subtext && <span className="quick-action-subtext"> {subtext}</span>}
            </div>
        )}
    </button>
);

export const AdminDashboardPage = () => {
    const { currentUser, children, staff, rooms, incidentReports, invoices, waitlistEntries, announcements, setCurrentPage } = useAppState();

    const totalChildren = children?.length || 0;
    const totalStaff = staff?.length || 0;
    const totalRooms = rooms?.length || 0;
    const openIncidents = incidentReports?.filter((ir: any) => ir.status?.toLowerCase() === 'open').length || 0;
    const unpaidInvoicesCount = invoices?.filter((inv: any) => ['unpaid', 'overdue'].includes(inv.status?.toLowerCase())).length || 0;
    const waitlistCount = waitlistEntries?.length || 0;
    const publishedAnnouncements = announcements?.filter((an: any) => an.is_published).length || 0;

    const quickActionsList = [
        { label: "Manage Children", page: 'Children', icon: Icons.Smile, count: totalChildren },
        { label: "Manage Staff", page: 'Staff', icon: Icons.UsersIconAliased, count: totalStaff },
        { label: "View Daily Reports", page: 'AdminDailyReports', icon: Icons.FileText },
        { label: "Manage Announcements", page: 'AdminAnnouncements', icon: Icons.Megaphone, count: publishedAnnouncements, subtext: "Published" },
        { label: "Handle Billing", page: 'AdminBilling', icon: Icons.DollarSign, count: unpaidInvoicesCount, subtext: "Unpaid" },
        { label: "Manage Waitlist", page: 'AdminWaitlist', icon: Icons.ListOrdered, count: waitlistCount },
        { label: "Log Incident", page: 'LogIncidentPage', icon: Icons.ShieldAlert },
        { label: "Manage Rooms", page: 'Rooms', icon: Icons.Building, count: totalRooms },
    ];

    return (
        <div className="page-card admin-dashboard space-y-8">
            <InfoMessage icon={Icons.HomeIcon} message={`Welcome back, ${currentUser?.name || 'Admin'}! Let's manage the daycare.`} type="info" />

            <div>
                <h2 className="dashboard-section-title text-2xl font-bold mb-4">At a Glance</h2>
                <div className="stats-grid">
                    <StatCardItem icon={Icons.Smile} value={totalChildren} label="Total Children" setCurrentPage={setCurrentPage} targetPage="Children" />
                    <StatCardItem icon={Icons.UsersIconAliased} value={totalStaff} label="Total Staff" setCurrentPage={setCurrentPage} targetPage="Staff" />
                    <StatCardItem icon={Icons.Building} value={totalRooms} label="Total Rooms" setCurrentPage={setCurrentPage} targetPage="Rooms" />
                    <StatCardItem icon={Icons.ShieldAlert} value={openIncidents} label="Open Incidents" color="text-destructive" setCurrentPage={setCurrentPage} targetPage="AdminIncidentReports" />
                    <StatCardItem icon={Icons.DollarSign} value={unpaidInvoicesCount} label="Unpaid Invoices" color="text-orange-500" setCurrentPage={setCurrentPage} targetPage="AdminBilling" />
                    <StatCardItem icon={Icons.ListOrdered} value={waitlistCount} label="On Waitlist" setCurrentPage={setCurrentPage} targetPage="AdminWaitlist" />
                </div>
            </div>

            <div>
                <h2 className="dashboard-section-title text-2xl font-bold mb-4">Quick Actions</h2>
                <div className="quick-actions-grid">
                    {quickActionsList.map(action => (
                        <QuickActionItem
                            key={action.page}
                            icon={action.icon}
                            label={action.label}
                            count={action.count}
                            subtext={action.subtext}
                            onClick={() => setCurrentPage(action.page)}
                            pageName={action.page} />
                    ))}
                </div>
            </div>
        </div>
    );
};
