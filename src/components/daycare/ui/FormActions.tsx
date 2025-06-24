import React from 'react';
import { Icons } from '@/components/Icons';
import type { LucideProps } from 'lucide-react';

interface FormActionsProps {
    onCancel: () => void;
    submitText?: string;
    cancelText?: string;
    submitIcon?: React.ComponentType<LucideProps>;
    loading?: boolean;
    disabled?: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({ onCancel, submitText = "Submit", cancelText = "Cancel", submitIcon: SubmitIcon, loading, disabled }) => (
    <div className="form-actions">
        <button type="button" onClick={onCancel} disabled={loading} className="btn btn-secondary">{cancelText}</button>
        <button type="submit" className="btn btn-primary" disabled={loading || disabled}>
            {loading ? <Icons.Clock size={18} className="animate-spin-css" /> : SubmitIcon && <SubmitIcon size={18} />}
            <span style={{ marginLeft: loading || SubmitIcon ? '8px' : '0' }}>{loading ? "Processing..." : submitText}</span>
        </button>
    </div>
);
