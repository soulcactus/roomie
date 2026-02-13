import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { icon: 24, text: 'text-lg' },
  md: { icon: 32, text: 'text-xl' },
  lg: { icon: 44, text: 'text-2xl' },
};

export function Logo({ variant = 'full', size = 'md', className }: LogoProps) {
  const { icon: iconSize, text: textClass } = sizeMap[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <LogoIcon size={iconSize} />
      {variant === 'full' && (
        <span
          className={cn(
            'font-brand font-bold tracking-tight text-foreground',
            textClass
          )}
        >
          Roomie
        </span>
      )}
    </div>
  );
}

interface LogoIconProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 32, className }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Roomie logo"
    >
      <g>
        <path
          d="M33 9.16667H11C7.96243 9.16667 5.5 11.6291 5.5 14.6667V33C5.5 36.0376 7.96243 38.5 11 38.5H33C36.0376 38.5 38.5 36.0376 38.5 33V14.6667C38.5 11.6291 36.0376 9.16667 33 9.16667Z"
          className="fill-brand-primary-light"
        />
        <path
          d="M33 9.16667H11C7.96243 9.16667 5.5 11.6291 5.5 14.6667V33C5.5 36.0376 7.96243 38.5 11 38.5H33C36.0376 38.5 38.5 36.0376 38.5 33V14.6667C38.5 11.6291 36.0376 9.16667 33 9.16667Z"
          className="stroke-brand-primary"
          strokeWidth="2.75"
        />
        <path
          d="M33 9.16667H11C7.96243 9.16667 5.5 11.2187 5.5 13.75C5.5 16.2813 7.96243 18.3333 11 18.3333H33C36.0376 18.3333 38.5 16.2813 38.5 13.75C38.5 11.2187 36.0376 9.16667 33 9.16667Z"
          className="fill-brand-primary"
        />
        <path
          d="M38.5 14.6667H5.5V18.3333H38.5V14.6667Z"
          className="fill-brand-primary"
        />
        <path
          d="M13.75 5.5V11.9167"
          className="stroke-brand-primary"
          strokeWidth="2.75"
          strokeLinecap="round"
        />
        <path
          d="M30.25 5.5V11.9167"
          className="stroke-brand-primary"
          strokeWidth="2.75"
          strokeLinecap="round"
        />
        <path
          d="M14.6667 25.6667L19.25 30.25L29.3333 20.1667"
          className="stroke-brand-primary"
          strokeWidth="3.66667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
