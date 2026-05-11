import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center justify-center font-heading font-medium uppercase tracking-widest text-[10px] leading-none select-none',
  {
    variants: {
      variant: {
        default:     'bg-[var(--surface-elevated)] text-white border border-white/[0.08]',
        'sold-out':  'bg-[var(--accent-blood)] text-white',
        members:     'bg-[var(--accent-gold)] text-black',
        new:         'bg-white text-black',
        'drop-live': 'bg-[var(--accent-blood)] text-white animate-pulse',
        muted:       'bg-transparent text-[var(--muted)] border border-white/[0.08]',
      },
      size: {
        sm:      'px-1.5 py-0.5',
        default: 'px-2 py-1',
        lg:      'px-3 py-1.5 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
