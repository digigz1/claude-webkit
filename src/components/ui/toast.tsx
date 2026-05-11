'use client'

import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: [
            'flex items-start gap-3 w-full',
            'bg-[var(--surface-elevated)] border border-white/[0.08]',
            'px-4 py-3 text-sm text-white font-body',
            'shadow-xl',
          ].join(' '),
          title: 'font-heading text-xs uppercase tracking-widest font-medium',
          description: 'text-[var(--muted)] text-xs mt-0.5',
          actionButton: 'bg-white text-black font-heading text-xs uppercase tracking-widest px-3 py-1.5',
          cancelButton: 'bg-transparent border border-white/20 text-white font-heading text-xs uppercase tracking-widest px-3 py-1.5',
          closeButton: 'text-[var(--muted)] hover:text-white',
          error: 'border-l-2 border-l-[var(--accent-blood)]',
          success: 'border-l-2 border-l-white',
          warning: 'border-l-2 border-l-[var(--accent-gold)]',
          info: 'border-l-2 border-l-white/40',
        },
      }}
      expand
      richColors={false}
      closeButton
    />
  )
}

export { toast } from 'sonner'
