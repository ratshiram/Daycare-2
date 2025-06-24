import React from 'react';
import type { LucideProps } from 'lucide-react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id?: string;
    name: string;
    icon?: React.ComponentType<LucideProps>;
}

export const InputField: React.FC<InputFieldProps> = ({ label, id, name, type = "text", value, onChange, required, placeholder, disabled, icon: Icon, step, min, max, accept }) => (
    <div className="input-group">
        <label htmlFor={id || name} className="input-label">{label}{required && <span className="required-asterisk">*</span>}</label>
        <div className="input-wrapper">
            {Icon && <Icon className="input-icon" size={18} />}
            <input type={type} id={id || name} name={name} value={value === null || value === undefined ? '' : value} onChange={onChange} required={required} placeholder={placeholder} disabled={disabled} step={step} min={min} max={max} accept={accept}
                className={`input-field ${Icon ? 'input-field-with-icon' : ''} ${type === 'file' ? 'input-field-file' : ''}`} />
        </div>
    </div>
);
