import React from 'react';

interface CheckboxFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id?: string;
    name: string;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({ label, id, name, checked, onChange, disabled }) => (
    <div className="input-group input-group-checkbox">
        <input type="checkbox" id={id || name} name={name} checked={checked} onChange={onChange} disabled={disabled} className="checkbox-field" />
        <label htmlFor={id || name} className="checkbox-label">{label}</label>
    </div>
);
