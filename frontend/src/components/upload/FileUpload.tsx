import { useCallback, useRef, useState } from 'react';
import { Button } from '../common/Button';
import type { ChangeEvent, DragEvent, FormEvent } from 'react';

interface FileUploadProps {
  onSubmit: (file: File) => Promise<void> | void;
  isSubmitting?: boolean;
  maxFileSizeMb?: number;
}

const ACCEPTED_TYPES = ['application/pdf'];

export function FileUpload({ onSubmit, isSubmitting = false, maxFileSizeMb = 10 }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const resetError = () => setError(null);

  const validateFile = useCallback(
    (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Only PDF files are supported right now.');
        return false;
      }

      const sizeInMb = file.size / (1024 * 1024);
      if (sizeInMb > maxFileSizeMb) {
        setError(`File is too large. Maximum size is ${maxFileSizeMb} MB.`);
        return false;
      }

      return true;
    },
    [maxFileSizeMb]
  );

  const handleFileSelection = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) {
        setSelectedFile(null);
        return;
      }

      const file = fileList[0];
      resetError();

      if (validateFile(file)) {
        setSelectedFile(file);
      } else {
        setSelectedFile(null);
      }
    },
    [validateFile]
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

    if (!selectedFile) {
      setError('Please choose a policy PDF before uploading.');
      return;
    }

    try {
      await onSubmit(selectedFile);
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : 'Failed to upload policy. Please try again.';
      setError(message);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900">Upload your policy PDF</h2>
          <p className="text-sm text-slate-600">
            We&apos;ll extract a structured summary, generate embeddings for Q&A, and surface anything that needs
            attention. PDFs up to {maxFileSizeMb} MB are supported.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-[1.1fr,1fr]">
          <div className="space-y-3 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">What happens after upload?</p>
            <ul className="list-disc space-y-2 pl-4">
              <li>We extract text and metadata directly from the PDF (OCR fallback coming soon).</li>
              <li>Chunk the policy and store embeddings for Retrieval-Augmented Q&A.</li>
              <li>Generate a policy summary with confidence indicators and source citations.</li>
              <li>You can review, edit, and confirm before filing claims.</li>
            </ul>
            <p className="text-xs text-slate-400">
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
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-300 bg-slate-50 hover:border-blue-400'
              }`}
            >
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-600">
                Drag &amp; drop or choose a file
              </span>
              <p className="text-sm text-slate-600">Accepts PDF (.pdf) — up to {maxFileSizeMb} MB</p>
              <input
                ref={fileInputRef}
                id="policy-upload"
                name="policy-upload"
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
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
              {selectedFile && (
                <div className="flex flex-col items-center gap-1 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">Selected:</span>
                  <span>{selectedFile.name}</span>
                </div>
              )}
            </label>

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Need help? Upload a sample policy to see how the extraction works before using a real document.
          </p>
          <Button type="submit" variant="primary" size="md" isLoading={isSubmitting} disabled={isSubmitting}>
            Upload and process policy
          </Button>
        </div>
      </form>
    </section>
  );
}
