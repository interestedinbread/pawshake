import { useEffect, useRef } from 'react';
import { Button } from './Button';

export type ConfirmationVariant = 'danger' | 'warning' | 'info';

interface ConfirmationDialogueProps {
  /**
   * Whether the dialog is open
   */
  isOpen: boolean;
  /**
   * Title of the dialog
   */
  title: string;
  /**
   * Main message/content of the dialog
   */
  message: string;
  /**
   * Optional additional details or warning text
   */
  details?: string;
  /**
   * Variant determines the color scheme and default button styles
   */
  variant?: ConfirmationVariant;
  /**
   * Text for the confirm button (defaults based on variant)
   */
  confirmText?: string;
  /**
   * Text for the cancel button
   */
  cancelText?: string;
  /**
   * Whether the confirm button should use danger styling
   */
  confirmButtonVariant?: 'primary' | 'danger' | 'outline';
  /**
   * Whether the confirm button is in a loading state
   */
  isConfirming?: boolean;
  /**
   * Callback when user confirms
   */
  onConfirm: () => void;
  /**
   * Callback when user cancels or closes
   */
  onCancel: () => void;
  /**
   * Optional callback when dialog is closed via backdrop click
   */
  onClose?: () => void;
}

const variantConfig: Record<ConfirmationVariant, {
  icon: string;
  iconColor: string;
  bgColor: string;
  borderColor: string;
}> = {
  danger: {
    icon: '⚠️',
    iconColor: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
  },
  warning: {
    icon: '⚠️',
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  info: {
    icon: 'ℹ️',
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
};

const defaultConfirmText: Record<ConfirmationVariant, string> = {
  danger: 'Delete',
  warning: 'Continue',
  info: 'Confirm',
};

export function ConfirmationDialogue({
  isOpen,
  title,
  message,
  details,
  variant = 'warning',
  confirmText,
  cancelText = 'Cancel',
  confirmButtonVariant,
  isConfirming = false,
  onConfirm,
  onCancel,
  onClose,
}: ConfirmationDialogueProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const config = variantConfig[variant];
  const finalConfirmText = confirmText || defaultConfirmText[variant];
  const finalConfirmVariant = confirmButtonVariant || (variant === 'danger' ? 'danger' : 'primary');

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        // Only trigger on Enter if not in a text input/textarea
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          onConfirm();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm, onCancel]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the backdrop itself, not the dialog content
    if (e.target === e.currentTarget) {
      if (onClose) {
        onClose();
      } else {
        onCancel();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-message"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`rounded-t-2xl border-b ${config.borderColor} ${config.bgColor} px-6 py-4`}>
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 text-2xl ${config.iconColor}`}>
              {config.icon}
            </div>
            <div className="flex-1">
              <h2
                id="confirmation-dialog-title"
                className="text-xl font-semibold text-slate-900"
              >
                {title}
              </h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p
            id="confirmation-dialog-message"
            className="text-sm text-slate-700 leading-relaxed"
          >
            {message}
          </p>
          {details && (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-xs text-slate-600 leading-relaxed">{details}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            size="md"
            onClick={onCancel}
            disabled={isConfirming}
          >
            {cancelText}
          </Button>
          <Button
            variant={finalConfirmVariant}
            size="md"
            onClick={onConfirm}
            isLoading={isConfirming}
            disabled={isConfirming}
            className="focus:ring-2 focus:ring-offset-2"
          >
            {finalConfirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

