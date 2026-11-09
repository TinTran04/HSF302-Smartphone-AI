import { useState } from 'react';
import { Icon } from './Icon';

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  minLength,
  maxLength,
  describedBy,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  minLength?: number;
  maxLength?: number;
  describedBy?: string;
  disabled?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-field">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          minLength={minLength}
          maxLength={maxLength}
          aria-describedby={describedBy}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required
        />
        <button
          type="button"
          className="icon-button"
          aria-label={visible ? `Ẩn ${label.toLowerCase()}` : `Hiện ${label.toLowerCase()}`}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
        >
          <Icon name={visible ? 'visibility_off' : 'visibility'} />
        </button>
      </div>
    </div>
  );
}
