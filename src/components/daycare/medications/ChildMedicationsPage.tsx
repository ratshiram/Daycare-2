
import React from 'react';
import { InfoMessage } from '../ui/InfoMessage';
import { Icons } from '@/components/Icons';
import type { Child, Medication } from '@/types';
import { formatDateForInput } from '@/lib/customUtils';
import Loading from '@/app/loading';

interface ChildMedicationsPageProps {
    child: Child;
    medications: Medication[];
    onOpenAddMedicationModal: (childId: string) => void;
    onOpenEditMedicationModal: (medication: Medication) => void;
    onOpenLogAdministrationModal: (medication: Medication) => void;
    onDeleteMedication: (medicationId: string) => void;
    onCancel: () => void;
}

export const ChildMedicationsPage: React.FC<ChildMedicationsPageProps> = ({
    child, medications, onOpenAddMedicationModal, onOpenEditMedicationModal, onOpenLogAdministrationModal, onDeleteMedication, onCancel
}) => {
    const childMedications = Array.isArray(medications) ? medications.filter(m => m.child_id === child.id) : [];

    return (
        <div className="page-card">
            <div className="flex justify-between items-center mb-4">
                <button onClick={onCancel} className="btn btn-secondary btn-small">
                    <Icons.ArrowLeft size={18} /> Back to Children
                </button>
            </div>

            <div className="page-card-header">
                <h2 className="page-card-title">Medications for {child.name}</h2>
                <button onClick={() => onOpenAddMedicationModal(child.id)} className="btn btn-primary btn-small">
                    <Icons.PlusCircle size={18} /> Add Medication
                </button>
            </div>

            {childMedications.length === 0 ? (
                <InfoMessage message={`${child.name} has no medications on file.`} icon={Icons.Pill} />
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="th-cell">Medication</th>
                                <th className="th-cell th-sm-hidden">Dosage</th>
                                <th className="th-cell th-md-hidden">Frequency</th>
                                <th className="th-cell th-lg-hidden">End Date</th>
                                <th className="th-cell th-actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {childMedications.map(med => (
                                <tr key={med.id} className="table-row">
                                    <td className="td-cell font-semibold">{med.medication_name}</td>
                                    <td className="td-cell th-sm-hidden">{med.dosage || 'N/A'}</td>
                                    <td className="td-cell th-md-hidden">{med.frequency_instructions || 'N/A'}</td>
                                    <td className="td-cell th-lg-hidden">{med.end_date ? formatDateForInput(med.end_date) : 'Ongoing'}</td>
                                    <td className="td-cell td-actions">
                                        <button onClick={() => onOpenLogAdministrationModal(med)} className="btn-icon table-action-button text-green-600" title="Log Dose">
                                            <Icons.ListChecks size={16} />
                                        </button>
                                        <button onClick={() => onOpenEditMedicationModal(med)} className="btn-icon table-action-button edit" title="Edit">
                                            <Icons.Edit3 size={16} />
                                        </button>
                                        <button onClick={() => onDeleteMedication(med.id)} className="btn-icon table-action-button delete" title="Delete">
                                            <Icons.Trash2 size={16} />
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
