import { useCallback, useRef, useState } from 'react';
import { Button } from '../common/Button';
import type { ChangeEvent, DragEvent, FormEvent } from 'react';
import { getUserFriendlyErrorMessage } from '../../utils/errorMessages';
import { ApiError } from '../../api/apiClient';

interface FileUploadProps {
  onSubmit: (files: File[]) => Promise<void> | void;
  isSubmitting?: boolean;
  maxFileSizeMb?: number;
  maxFiles?: number;
}

const ACCEPTED_TYPES = ['application/pdf'];

export function FileUpload({ onSubmit, isSubmitting = false, maxFileSizeMb = 10, maxFiles = 10 }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const resetError = () => setError(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        return `"${file.name}" is not a PDF file. Only PDF files are supported.`;
      }

      const sizeInMb = file.size / (1024 * 1024);
      if (sizeInMb > maxFileSizeMb) {
        return `"${file.name}" is too large (${sizeInMb.toFixed(1)} MB). Maximum size is ${maxFileSizeMb} MB.`;
      }

      return null;
    },
    [maxFileSizeMb]
  );

  const handleFileSelection = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) {
        setSelectedFiles([]);
        return;
      }

      resetError();

      // Convert FileList to Array
      const filesArray = Array.from(fileList);

      // Check max files limit
      if (filesArray.length > maxFiles) {
        setError(`You can only upload up to ${maxFiles} files at once.`);
        setSelectedFiles([]);
        return;
      }

      // Validate all files
      const validFiles: File[] = [];
      const errors: string[] = [];

      filesArray.forEach((file) => {
        const validationError = validateFile(file);
        if (validationError) {
          errors.push(validationError);
        } else {
          validFiles.push(file);
        }
      });

      // If there are validation errors, show the first one
      if (errors.length > 0) {
        setError(errors[0]);
        // Still set valid files if any
        setSelectedFiles(validFiles);
      } else {
        // Combine with existing files (for adding more files)
        setSelectedFiles((prev) => {
          const combined = [...prev, ...validFiles];
          // Remove duplicates by name
          const unique = combined.filter((file, index, self) =>
            index === self.findIndex((f) => f.name === file.name && f.size === file.size)
          );
          return unique;
        });
      }
    },
    [validateFile, maxFiles]
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(event.target.files);
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileSelection(event.dataTransfer.files);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetError();

    if (selectedFiles.length === 0) {
      setError('Please choose at least one policy PDF before uploading.');
      return;
    }

    try {
      await onSubmit(selectedFiles);
      // Clear selected files after successful upload
      setSelectedFiles([]);
    } catch (submissionError) {
      const statusCode = submissionError instanceof ApiError ? submissionError.statusCode : undefined;
      const message = getUserFriendlyErrorMessage(
        submissionError,
        statusCode,
        { action: 'upload files', resource: 'files' }
      );
      setError(message);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <section className="rounded-2xl border shadow-lg bg-[var(--color-dark-surface)] border-[var(--color-dark-border)]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-[var(--color-dark-text-primary)] font-['Nunito']">Upload your policy PDFs</h2>
          <p className="text-sm text-[var(--color-dark-text-secondary)]">
            Upload one or more PDFs to add to this policy bundle. We&apos;ll extract a structured summary and get your policy ready for analysis. PDFs up to {maxFileSizeMb} MB are supported (max {maxFiles} files).
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-[1.1fr,1fr]">
          <div className="space-y-3 text-sm text-[var(--color-dark-text-secondary)]">
            <p className="font-semibold text-[var(--color-dark-text-primary)]">What happens after upload?</p>
            <ul className="list-disc space-y-2 pl-4">
              <li>We extract text and metadata directly from the PDF (OCR fallback coming soon).</li>
              <li>We convert the policy into data called vector embeddings, allowing our agent interpret them rapidly.</li>
              <li>We generate a policy summary with confidence indicators and source citations.</li>
            </ul>
            <p className="text-xs text-[var(--color-dark-text-muted)]">
              Uploading indicates you have the right to process this document. We keep data inside your account only.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <label
              htmlFor="policy-upload"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                isDragging
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                  : 'border-[var(--color-dark-border)] bg-[var(--color-dark-card)] hover:border-[var(--color-primary)]/50'
              }`}
            >
              <span className="rounded-full bg-[var(--color-primary)]/20 px-3 py-1 text-sm font-medium text-[var(--color-primary)]">
                Drag &amp; drop or choose files
              </span>
              <p className="text-sm text-[var(--color-dark-text-secondary)]">Accepts PDF (.pdf) — up to {maxFileSizeMb} MB per file</p>
              <input
                ref={fileInputRef}
                id="policy-upload"
                name="policy-upload"
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                multiple
                className="sr-only"
                onChange={handleInputChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse files
              </Button>
              {selectedFiles.length > 0 && (
                <div className="w-full mt-2 space-y-2">
                  <p className="text-xs font-medium text-[var(--color-dark-text-primary)]">
                    {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected:
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between bg-[var(--color-dark-surface)] border border-[var(--color-dark-border)] rounded px-2 py-1 text-xs"
                      >
                        <span className="text-[var(--color-dark-text-secondary)] truncate flex-1 mr-2">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="text-[#fca5a5] hover:text-[#f87171] font-medium transition-colors"
                          aria-label={`Remove ${file.name}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </label>

            {error && (
              <div className="rounded-lg border px-3 py-2 text-sm border-[rgba(239,68,68,0.5)] bg-[rgba(239,68,68,0.1)] text-[#fca5a5]">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--color-dark-text-muted)]">
            Need help? Upload a sample policy to see how the extraction works before using a real document.
          </p>
          <Button 
            type="submit" 
            variant="primary" 
            size="md" 
            isLoading={isSubmitting} 
            disabled={isSubmitting || selectedFiles.length === 0}
          >
            Upload {selectedFiles.length > 0 ? `${selectedFiles.length} ` : ''}file{selectedFiles.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </form>
    </section>
  );
}
