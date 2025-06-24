import React from 'react';
import { useAppState } from '@/app/app';
import { InfoMessage } from '../ui/InfoMessage';
import { Icons } from '@/components/Icons';

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

export const TeacherDashboardPage = () => {
    const { currentUser, setCurrentPage } = useAppState();
    return (
        <div className="page-card admin-dashboard space-y-8">
            <InfoMessage icon={Icons.Briefcase} message={`Welcome, ${currentUser?.name || 'Teacher'}!`} type="info" />
            <div>
                <h2 className="dashboard-section-title text-2xl font-bold mb-4">Your Focus Today</h2>
                <div className="quick-actions-grid">
                    <QuickActionItem
                        icon={Icons.FileText}
                        label="View/Create Daily Reports"
                        onClick={() => setCurrentPage('AdminDailyReports')} />
                    <QuickActionItem
                        icon={Icons.Camera}
                        label="View Photo Gallery"
                        onClick={() => setCurrentPage('AdminGallery')} />
                    <QuickActionItem
                        icon={Icons.Megaphone}
                        label="View Announcements"
                        onClick={() => setCurrentPage('AdminAnnouncements')} />
                </div>
            </div>
        </div>
    );
};
