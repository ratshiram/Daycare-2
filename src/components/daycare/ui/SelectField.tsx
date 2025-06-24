import React from 'react';
import type { LucideProps } from 'lucide-react';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    id?: string;
    name: string;
    icon?: React.ComponentType<LucideProps>;
}

export const SelectField: React.FC<SelectFieldProps> = ({ label, id, name, value, onChange, required, children, disabled, icon: Icon }) => (
    <div className="input-group">
        <label htmlFor={id || name} className="input-label">{label}{required && <span className="required-asterisk">*</span>}</label>
        <div className="input-wrapper">
            {Icon && <Icon className="input-icon" size={18} />}
            <select id={id || name} name={name} value={value} onChange={onChange} required={required} disabled={disabled}
                className={`input-field select-field ${Icon ? 'input-field-with-icon' : ''}`}>
                {children}
            </select>
        </div>
    </div>
);
