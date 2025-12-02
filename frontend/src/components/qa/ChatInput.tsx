import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Button } from '../common/Button';

interface ChatInputProps {
  onSubmit: (question: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSubmit,
  isLoading = false,
  disabled = false,
  placeholder = 'Ask a question about your policy...',
}: ChatInputProps) {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuestion = question.trim();
    if (trimmedQuestion && !isLoading && !disabled) {
      onSubmit(trimmedQuestion);
      setQuestion('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (but allow Shift+Enter for new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const trimmedQuestion = question.trim();
      if (trimmedQuestion && !isLoading && !disabled) {
        onSubmit(trimmedQuestion);
        setQuestion('');
      }
    }
  };

  const isSubmitDisabled = !question.trim() || isLoading || disabled;

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2 items-end rounded-lg border border-[var(--color-dark-border)] bg-[var(--color-dark-surface)] p-2 shadow-sm focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)] focus-within:ring-offset-0">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={1}
          className="flex-1 resize-none border-0 focus:outline-none focus:ring-0 px-2 py-2 text-sm text-[var(--color-dark-text-primary)] placeholder:text-[var(--color-dark-text-muted)] disabled:bg-[var(--color-dark-surface)] disabled:cursor-not-allowed bg-transparent"
          style={{
            minHeight: '40px',
            maxHeight: '120px',
          }}
          onInput={(e) => {
            // Auto-resize textarea
            const target = e.currentTarget;
            target.style.height = 'auto';
            target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
          }}
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={isSubmitDisabled}
          isLoading={isLoading}
          className="flex-shrink-0"
        >
          Send
        </Button>
      </div>
    </form>
  );
}

