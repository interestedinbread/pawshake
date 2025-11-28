import { useState } from 'react';

interface EditableFieldProps {
  label?: string;
  value?: string | number;
  helperText?: string;
  editable?: boolean;
  onEdit?: (value: string) => void;
  highlight?: boolean;
}

export function EditableField({
  label,
  value = 'Unknown',
  helperText,
  editable = false,
  onEdit,
  highlight = false,
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
      {label && <p className="text-sm font-medium text-[var(--color-dark-text-muted)]">{label}</p>}
      <div className="flex items-center gap-2">
        {isEditing ? (
          <input
            className="w-full rounded border px-3 py-1 text-sm bg-[var(--color-dark-card)] border-[var(--color-dark-border)] text-[var(--color-dark-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
          />
        ) : (
          <p className={`text-base ${highlight ? 'text-[var(--color-primary)] font-semibold' : 'text-[var(--color-dark-text-primary)]'}`}>{value ?? 'Unknown'}</p>
        )}
        {canEdit && (
          <button
            type="button"
            className="text-xs font-medium text-[var(--color-primary)] hover:opacity-80"
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
      {helperText && <p className="text-xs text-[var(--color-dark-text-muted)]">{helperText}</p>}
    </div>
  );
}
