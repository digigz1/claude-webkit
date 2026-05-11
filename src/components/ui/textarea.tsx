import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[120px] w-full',
        'border border-white/[0.08] bg-[var(--surface-elevated)]',
        'px-3 py-3',
        'font-body text-sm text-white placeholder:text-[var(--muted)]',
        'focus:outline-none focus:border-white/40',
        'transition-colors duration-[120ms] ease-in',
        'disabled:cursor-not-allowed disabled:opacity-40',
        'resize-y rounded-none',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'

export { Textarea }
