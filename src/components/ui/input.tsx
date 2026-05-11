import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'underline'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', ...props }, ref) => {
    if (variant === 'underline') {
      return (
        <input
          type={type}
          ref={ref}
          className={cn(
            'w-full bg-transparent border-b border-white/30 pb-2',
            'font-body text-sm text-white placeholder:text-[var(--muted)]',
            'focus:outline-none focus:border-white',
            'transition-colors duration-[120ms] ease-in',
            'disabled:cursor-not-allowed disabled:opacity-40',
            className,
          )}
          {...props}
        />
      )
    }

    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-11 w-full',
          'border border-white/[0.08] bg-[var(--surface-elevated)]',
          'px-3 py-2',
          'font-body text-sm text-white placeholder:text-[var(--muted)]',
          'focus:outline-none focus:border-white/40',
          'transition-colors duration-[120ms] ease-in',
          'disabled:cursor-not-allowed disabled:opacity-40',
          'rounded-none',
          className,
        )}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
