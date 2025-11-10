import { useState } from 'react';

interface EditableFieldProps {
  label?: string;
  value?: string | number;
  helperText?: string;
  editable?: boolean;
  onEdit?: (value: string) => void;
}

export function EditableField({
  label,
  value = 'Unknown',
  helperText,
  editable = false,
  onEdit,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(String(value ?? ''));

  const canEdit = editable || Boolean(onEdit);

  const handleSave = () => {
    if (onEdit) {
      onEdit(draftValue);
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-1">
      {label && <p className="text-sm font-medium text-slate-500">{label}</p>}
      <div className="flex items-center gap-2">
        {isEditing ? (
          <input
            className="w-full rounded border border-slate-300 px-3 py-1 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
          />
        ) : (
          <p className="text-base text-slate-900">{value ?? 'Unknown'}</p>
        )}
        {canEdit && (
          <button
            type="button"
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setDraftValue(String(value ?? ''));
                setIsEditing(true);
              }
            }}
          >
            {isEditing ? 'Save' : 'Edit'}
          </button>
        )}
      </div>
      {helperText && <p className="text-xs text-slate-400">{helperText}</p>}
    </div>
  );
}
