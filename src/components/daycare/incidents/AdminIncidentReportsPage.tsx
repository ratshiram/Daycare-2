import React from 'react';
import { InfoMessage } from '../ui/InfoMessage';
import { Icons } from '@/components/Icons';
import type { IncidentReport, Child, Staff } from '@/types';
import { formatDateTimeForInput } from '@/lib/customUtils';
import Loading from '@/app/loading';

interface AdminIncidentReportsPageProps {
    incidentReports: IncidentReport[];
    loading: boolean;
    children: Child[];
    staff: Staff[];
    onNavigateToLogIncident: () => void;
    onViewIncidentDetails: (incident: IncidentReport) => void;
}

export const AdminIncidentReportsPage: React.FC<AdminIncidentReportsPageProps> = ({ incidentReports, loading, children, staff, onNavigateToLogIncident, onViewIncidentDetails }) => {
    if (loading && (!Array.isArray(incidentReports) || incidentReports.length === 0)) return <Loading />;

    const childNameMap = Array.isArray(children) ? children.reduce((acc, child) => {
        acc[child.id] = child.name;
        return acc;
    }, {} as Record<string, string>) : {};

    const staffNameMap = Array.isArray(staff) ? staff.reduce((acc, s) => {
        acc[s.id] = s.name;
        return acc;
    }, {} as Record<string, string>) : {};

    return (
        <div className="page-card">
            <div className="page-card-header">
                <h2 className="page-card-title">Incident Reports</h2>
                <button onClick={onNavigateToLogIncident} className="btn btn-primary btn-small">
                    <Icons.PlusCircle size={18} /> Log New Incident
                </button>
            </div>
            {(!loading && (!Array.isArray(incidentReports) || incidentReports.length === 0)) ? (
                <InfoMessage message="No incident reports have been logged." icon={Icons.ShieldAlert} />
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="th-cell">Date & Time</th>
                                <th className="th-cell">Child</th>
                                <th className="th-cell th-sm-hidden">Status</th>
                                <th className="th-cell th-md-hidden">Reported By</th>
                                <th className="th-cell th-actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(incidentReports) && incidentReports.map(incident => (
                                <tr key={incident.id} className="table-row">
                                    <td className="td-cell">{formatDateTimeForInput(incident.incident_datetime)?.replace('T', ' ')}</td>
                                    <td className="td-cell td-name font-semibold">{incident.child_id ? childNameMap[incident.child_id] : 'N/A'}</td>
                                    <td className="td-cell td-sm-hidden">
                                        <span className={`status-badge status-badge-${incident.status?.toLowerCase() || 'open'}`}>{incident.status || 'Open'}</span>
                                    </td>
                                    <td className="td-cell td-md-hidden">{staffNameMap[incident.reported_by_staff_id] || 'Unknown'}</td>
                                    <td className="td-cell td-actions">
                                        <button onClick={() => onViewIncidentDetails(incident)} className="btn-icon table-action-button" title="View Details">
                                            <Icons.Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
