import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  required,
  id,
  ...props
}: InputProps) {
  // Generate unique ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const labelId = label ? `label-${inputId}` : undefined;

  // Base input styles
  const baseStyles = 'block w-full rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0';
  
  // Error state styles
  const errorStyles = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  
  // Padding adjustments for icons
  const paddingStyles = leftIcon ? 'pl-10' : 'pl-3';
  const paddingRightStyles = rightIcon ? 'pr-10' : 'pr-3';
  
  // Disabled state
  const disabledStyles = props.disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white';
  
  // Combine all input styles
  const inputClasses = `
    ${baseStyles}
    ${errorStyles}
    ${paddingStyles}
    ${paddingRightStyles}
    ${disabledStyles}
    ${fullWidth ? 'w-full' : ''}
    py-2
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          id={labelId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input wrapper with icons */}
      <div className="relative">
        {/* Left icon */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {leftIcon}
          </div>
        )}

        {/* Input element */}
        <input
          id={inputId}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `error-${inputId}` : helperText ? `helper-${inputId}` : undefined
          }
          required={required}
          {...props}
        />

        {/* Right icon */}
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p
          id={`error-${inputId}`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}

      {/* Helper text (shown when no error) */}
      {helperText && !error && (
        <p
          id={`helper-${inputId}`}
          className="mt-1 text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}

