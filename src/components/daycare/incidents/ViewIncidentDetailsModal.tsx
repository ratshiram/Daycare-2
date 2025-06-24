import React from 'react';
import { Modal } from '../ui/Modal';
import type { IncidentReport, Child, Staff } from '@/types';
import { formatDateTimeForInput } from '@/lib/customUtils';

interface ViewIncidentDetailsModalProps {
    incident: IncidentReport | null;
    child: Child | undefined;
    reportedByStaff: Staff | undefined;
    onClose: () => void;
}

export const ViewIncidentDetailsModal: React.FC<ViewIncidentDetailsModalProps> = ({ incident, child, reportedByStaff, onClose }) => {
    if (!incident) return null;

    const childName = child?.name || 'Unknown Child';
    const staffName = reportedByStaff?.name || 'Unknown Staff';

    const renderDetail = (label: string, value?: string | boolean | null) => {
        let displayValue: string;
        if (typeof value === 'boolean') {
            displayValue = value ? 'Yes' : 'No';
        } else {
            displayValue = value || 'N/A';
        }
        return <div className="report-detail-item"><strong>{label}:</strong> {displayValue}</div>
    };
    
    return (
        <Modal onClose={onClose} title={`Incident Report for ${childName}`} size="large">
            <div className="report-details-grid">
                {renderDetail("Child", childName)}
                {renderDetail("Date & Time", formatDateTimeForInput(incident.incident_datetime)?.replace('T', ' '))}
                {renderDetail("Location", incident.location)}
                {renderDetail("Status", incident.status)}
                
                <div className="report-section md:col-span-2"><h4>Description</h4> <p>{incident.description || 'N/A'}</p></div>
                <div className="report-section md:col-span-2"><h4>Actions Taken</h4> <p>{incident.actions_taken || 'N/A'}</p></div>

                {renderDetail("Witnesses", incident.witnesses)}
                {renderDetail("Reported By", staffName)}
                
                <div className="report-section md:col-span-2 border-t pt-4 mt-2">
                    <h4 className="font-semibold mb-2">Parent Notification</h4>
                    {renderDetail("Notified?", incident.parent_notified)}
                    {incident.parent_notified && renderDetail("Notification Time", formatDateTimeForInput(incident.parent_notification_datetime)?.replace('T', ' '))}
                </div>
            </div>
        </Modal>
    );
};
