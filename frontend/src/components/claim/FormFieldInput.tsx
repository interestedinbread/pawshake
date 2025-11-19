import { type FormField } from '../../api/claimApi';
import { AutoFillIndicator } from './AutoFillIndicator';

interface FormFieldInputProps {
  field: FormField;
  value?: string | boolean | number;
  onChange?: (value: string | boolean | number) => void;
  isAutoFilled?: boolean;
  error?: string;
  disabled?: boolean;
}

export function FormFieldInput({
  field,
  value,
  onChange,
  isAutoFilled = false,
  error,
  disabled = false,
}: FormFieldInputProps) {
  const fieldId = `field-${field.name.replace(/\s+/g, '-').toLowerCase()}`;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    if (!onChange) return;

    if (field.type === 'checkbox') {
      onChange((e.target as HTMLInputElement).checked);
    } else {
      onChange(e.target.value);
    }
  };

  // Render based on field type
  const renderInput = () => {
    switch (field.type) {
      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={fieldId}
              checked={value === true || value === 'true'}
              onChange={handleChange}
              disabled={disabled}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label
              htmlFor={fieldId}
              className={`text-sm font-medium ${
                disabled ? 'text-slate-400' : 'text-slate-700 cursor-pointer'
              }`}
            >
              {field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
        );

      case 'radio':
        if (!field.options || field.options.length === 0) {
          return (
            <div className="text-sm text-slate-500">
              No options available for {field.name}
            </div>
          );
        }
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {field.options.map((option, index) => {
                const optionId = `${fieldId}-${index}`;
                const isChecked = value === option || (index === 0 && value === undefined);
                return (
                  <div key={optionId} className="flex items-center gap-2">
                    <input
                      type="radio"
                      id={optionId}
                      name={fieldId}
                      value={option}
                      checked={isChecked}
                      onChange={handleChange}
                      disabled={disabled}
                      className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <label
                      htmlFor={optionId}
                      className={`text-sm ${
                        disabled ? 'text-slate-400' : 'text-slate-700 cursor-pointer'
                      }`}
                    >
                      {option}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'dropdown':
        if (!field.options || field.options.length === 0) {
          return (
            <div className="text-sm text-slate-500">
              No options available for {field.name}
            </div>
          );
        }
        return (
          <div>
            <label
              htmlFor={fieldId}
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              {field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              id={fieldId}
              value={value?.toString() || ''}
              onChange={handleChange}
              disabled={disabled}
              className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                error
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
              } ${
                disabled
                  ? 'bg-slate-100 cursor-not-allowed opacity-60'
                  : 'bg-white'
              }`}
            >
              <option value="">-- Select --</option>
              {field.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case 'date': {
        // Format value for date input (YYYY-MM-DD) or handle MM/DD/YY format
        let dateValue = '';
        if (value) {
          const dateStr = value.toString();
          // If it's in MM/DD/YY format, try to convert
          if (dateStr.includes('/')) {
            const [month, day, year] = dateStr.split('/');
            const fullYear = year.length === 2 ? `20${year}` : year;
            dateValue = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          } else {
            dateValue = dateStr;
          }
        }
        return (
          <div>
            <label
              htmlFor={fieldId}
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              {field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              id={fieldId}
              value={dateValue}
              onChange={handleChange}
              disabled={disabled}
              className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                error
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
              } ${
                disabled
                  ? 'bg-slate-100 cursor-not-allowed opacity-60'
                  : 'bg-white'
              }`}
            />
          </div>
        );
      }

      case 'text':
      default: {
        // Use textarea for longer fields (based on field name)
        const isLongField =
          field.name.toLowerCase().includes('condition') ||
          field.name.toLowerCase().includes('description') ||
          field.name.toLowerCase().includes('notes');
        
        if (isLongField) {
          return (
            <div>
              <label
                htmlFor={fieldId}
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                {field.name}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <textarea
                id={fieldId}
                value={value?.toString() || ''}
                onChange={handleChange}
                disabled={disabled}
                rows={3}
                className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 resize-y ${
                  error
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                } ${
                  disabled
                    ? 'bg-slate-100 cursor-not-allowed opacity-60'
                    : 'bg-white'
                }`}
              />
            </div>
          );
        }
        
        return (
          <div>
            <label
              htmlFor={fieldId}
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              {field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              id={fieldId}
              value={value?.toString() || ''}
              onChange={handleChange}
              disabled={disabled}
              className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                error
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
              } ${
                disabled
                  ? 'bg-slate-100 cursor-not-allowed opacity-60'
                  : 'bg-white'
              }`}
            />
          </div>
        );
      }
    }
  };

  return (
    <div className="space-y-1">
      {renderInput()}
      {isAutoFilled && <AutoFillIndicator />}
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

