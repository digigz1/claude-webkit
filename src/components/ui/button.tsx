import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-heading font-medium uppercase tracking-widest text-xs',
    'transition-colors duration-[120ms] ease-in',
    'disabled:pointer-events-none disabled:opacity-40',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 focus-visible:ring-offset-1 focus-visible:ring-offset-black',
    'select-none cursor-pointer',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'bg-white text-black hover:bg-white/90 active:bg-white/80',
        blood:
          'bg-[var(--accent-blood)] text-white hover:bg-[#c70500] active:bg-[#b00400]',
        gold:
          'bg-[var(--accent-gold)] text-black hover:bg-[#b8983f] active:bg-[#a8882f]',
        outline:
          'border border-white/20 text-white bg-transparent hover:border-white/60 hover:bg-white/5 active:bg-white/10',
        ghost:
          'text-white bg-transparent hover:text-white/70 active:text-white/50',
        muted:
          'text-[var(--muted)] bg-transparent hover:text-white',
        link:
          'text-white underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        xs:      'h-7 px-3 text-[10px]',
        sm:      'h-9 px-4',
        default: 'h-11 px-6',
        lg:      'h-14 px-8 text-sm',
        icon:    'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-12 w-12 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>['variant']
>

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled ?? loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="sr-only">Cargando...</span>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </>
        ) : (
          children
        )}
      </Comp>
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
