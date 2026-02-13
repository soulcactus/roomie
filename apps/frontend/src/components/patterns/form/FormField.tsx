'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface FormFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
  wrapperClassName?: string;
  inputClassName?: string;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      className,
      type,
      label,
      error,
      showPasswordToggle,
      id,
      wrapperClassName,
      inputClassName,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputId = id || React.useId();
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
      <div className={cn('space-y-2.5', wrapperClassName)}>
        {label && (
          <Label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground md:text-base"
          >
            {label}
          </Label>
        )}
        <div className="relative">
          <Input
            id={inputId}
            type={inputType}
            ref={ref}
            className={cn(
              'h-12 rounded-[10px] border bg-gray-50/50 px-3 text-sm shadow-none md:h-14',
              'placeholder:text-brand-placeholder focus-visible:ring-0',
              error ? 'border-brand-danger-border' : 'border-gray-200',
              isPassword && showPasswordToggle && 'pr-10',
              inputClassName,
              className,
            )}
            {...props}
          />
          {isPassword && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50"
              tabIndex={-1}
              disabled={props.disabled}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-brand-danger-text md:text-sm">{error}</p>}
      </div>
    );
  },
);

FormField.displayName = 'FormField';
