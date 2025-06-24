import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Icons } from '@/components/Icons';
import type { DailyReport, Child, Staff } from '@/types';
import { formatDateForInput, formatTime } from '@/lib/customUtils';
import { generateDailyReportSummary } from '@/ai/flows/daily-report-summary';
import { Button } from '@/components/ui/button';

interface ViewDailyReportModalProps {
    report: DailyReport | null;
    child: Child | undefined;
    staff: Staff[];
    onClose: () => void;
}

export const ViewDailyReportModal: React.FC<ViewDailyReportModalProps> = ({ report, child, staff, onClose }) => {
    const [summary, setSummary] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    if (!report) return null;

    const childName = child?.name || 'Unknown Child';
    const reportingStaffMember = Array.isArray(staff) ? (staff.find(s => s.id === report.staff_id)) : null;
    const staffName = reportingStaffMember?.name || 'Unknown Staff';

    const handleGenerateSummary = async () => {
        if (!report || !child) return;
        setIsGenerating(true);
        setSummary('');
        try {
            const input = {
                childName: child.name,
                mood: report.mood || 'Not specified',
                meals: {
                    breakfast: report.meals?.breakfast || 'Not specified',
                    lunch: report.meals?.lunch || 'Not specified',
                    snack_am: report.meals?.snack_am || 'Not specified',
                    snack_pm: report.meals?.snack_pm || 'Not specified',
                },
                naps: report.naps || [],
                activities: report.activities || 'Not specified',
                toileting_diapers: report.toileting_diapers || 'Not specified',
                notes_for_parents: report.notes_for_parents || 'Not specified',
            };
            const result = await generateDailyReportSummary(input);
            setSummary(result.summary);
        } catch (error) {
            console.error("Failed to generate AI summary:", error);
            setSummary("Sorry, we couldn't generate a summary at this time.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Modal onClose={onClose} title={`Daily Report for ${childName} - ${formatDateForInput(report.report_date)}`} size="large">
            <div className="report-details-grid">
                <div className="report-detail-item"><strong>Mood:</strong> <span className={`status-badge status-badge-${report.mood?.toLowerCase()}`}>{report.mood || 'N/A'}</span></div>
                <div className="report-section"><h4>Meals</h4> <p><strong>Breakfast:</strong> {report.meals?.breakfast || 'N/A'}</p> <p><strong>Lunch:</strong> {report.meals?.lunch || 'N/A'}</p></div>
                <div className="report-section"><h4>Naps</h4> {(report.naps && report.naps.length > 0 && report.naps[0].start) ? report.naps?.map((nap, i) => <p key={i}><strong>Nap {i + 1}:</strong> {formatTime(nap.start)} - {formatTime(nap.end)}</p>) : <p>No naps recorded.</p>}</div>
                <div className="report-section"><h4>Activities & Care</h4> <p><strong>Activities:</strong> {report.activities || 'N/A'}</p> <p><strong>Toileting/Diapers:</strong> {report.toileting_diapers || 'N/A'}</p></div>
                <div className="report-section"><h4>Notes & Supplies</h4> <p><strong>Supplies Needed:</strong> {report.supplies_needed || 'N/A'}</p> <p><strong>Notes for Parents:</strong> {report.notes_for_parents || 'N/A'}</p></div>
                {(report.photo_url_1 || report.photo_url_2) && (
                    <div className="report-section md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <h4>Photos</h4>
                        {report.photo_url_1 && <div className="report-photo-item"><p><strong>Photo 1:</strong></p><img src={report.photo_url_1} alt="Report photo 1" className="report-photo-preview" /></div>}
                        {report.photo_url_2 && <div className="report-photo-item"><p><strong>Photo 2:</strong></p><img src={report.photo_url_2} alt="Report photo 2" className="report-photo-preview" /></div>}
                    </div>
                )}
                 <div className="report-section md:col-span-2">
                    <h4>AI-Powered Summary</h4>
                    <Button onClick={handleGenerateSummary} disabled={isGenerating}>
                        {isGenerating ? <Icons.Clock className="animate-spin-css mr-2" /> : null}
                        {isGenerating ? 'Generating...' : 'Generate AI Summary'}
                    </Button>
                    {summary && <div className="mt-4 p-3 bg-secondary rounded-md text-sm"><p>{summary}</p></div>}
                </div>
                <p className="report-meta md:col-span-2 text-right text-sm text-muted-foreground"><em>Reported by: {staffName}</em></p>
            </div>
        </Modal>
    );
};
