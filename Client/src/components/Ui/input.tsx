import React, { type InputHTMLAttributes } from 'react';
import { theme } from '../../theme';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, rightIcon, error, ...props }, ref) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
        {label && (
          <label style={{ fontSize: 13, fontWeight: 600, color: theme.sub }}>
            {label}
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {icon && (
            <div style={{ position: 'absolute', left: 14, color: theme.sub, display: 'flex', alignItems: 'center' }}>
              {icon}
            </div>
          )}
          <input
            ref={ref}
            style={{
              width: '100%',
              padding: `12px ${rightIcon ? '40px' : '16px'} 12px ${icon ? '40px' : '16px'}`,
              borderRadius: 12,
              border: `1.5px solid ${error ? '#ef4444' : theme.border}`,
              background: '#f8fafc',
              fontSize: 14,
              color: theme.text,
              outline: 'none',
              transition: 'all 0.2s',
              fontFamily: 'inherit'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = error ? '#ef4444' : theme.blue;
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.boxShadow = error ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(21, 96, 232, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error ? '#ef4444' : theme.border;
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.boxShadow = 'none';
            }}
            {...props}
          />
          {rightIcon && (
            <div style={{ position: 'absolute', right: 14, display: 'flex', alignItems: 'center' }}>
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <span style={{ fontSize: 12, color: '#ef4444', marginTop: 2 }}>{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
