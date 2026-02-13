interface FormErrorProps {
  message: string;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  return (
    <div
      className={[
        'mt-5 rounded-lg border border-brand-danger-border bg-brand-danger-bg p-3',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <p className="text-sm text-brand-danger-text">{message}</p>
    </div>
  );
}
