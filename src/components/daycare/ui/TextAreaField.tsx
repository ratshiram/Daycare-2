import React from 'react';

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    id?: string;
    name: string;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({ label, id, name, value, onChange, required, placeholder, rows = 3, disabled }) => (
    <div className="input-group">
        <label htmlFor={id || name} className="input-label">{label}{required && <span className="required-asterisk">*</span>}</label>
        <textarea id={id || name} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} rows={rows} disabled={disabled}
            className="textarea-field" />
    </div>
);
