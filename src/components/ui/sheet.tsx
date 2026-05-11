'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close
const SheetPortal = DialogPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-[300] bg-black/60 backdrop-blur-[2px]',
      'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-in data-[state=closed]:opacity-0',
      className,
    )}
    {...props}
  />
))
SheetOverlay.displayName = 'SheetOverlay'

const sheetVariants = cva(
  [
    'fixed z-[400] flex flex-col',
    'bg-[var(--surface)] border-white/[0.08]',
    'shadow-xl',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'transition-transform duration-200 ease-in',
  ].join(' '),
  {
    variants: {
      side: {
        right: [
          'inset-y-0 right-0 h-full w-full max-w-md border-l',
          'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
        ].join(' '),
        left: [
          'inset-y-0 left-0 h-full w-full border-r',
          'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
        ].join(' '),
        top: [
          'inset-x-0 top-0 w-full border-b',
          'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        ].join(' '),
        bottom: [
          'inset-x-0 bottom-0 w-full border-t',
          'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        ].join(' '),
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  showClose?: boolean
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ side = 'right', showClose = true, className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
      {showClose && (
        <DialogPrimitive.Close className="absolute right-4 top-4 text-[var(--muted)] hover:text-white transition-colors duration-[120ms] focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40">
          <X size={20} aria-hidden="true" />
          <span className="sr-only">Cerrar</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = 'SheetContent'

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex items-center justify-between px-6 py-4 border-b border-white/[0.08] shrink-0',
      className,
    )}
    {...props}
  />
)
SheetHeader.displayName = 'SheetHeader'

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'font-heading font-bold uppercase tracking-widest text-sm text-white',
      className,
    )}
    {...props}
  />
))
SheetTitle.displayName = 'SheetTitle'

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-[var(--muted)]', className)}
    {...props}
  />
))
SheetDescription.displayName = 'SheetDescription'

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'mt-auto border-t border-white/[0.08] p-6 shrink-0',
      className,
    )}
    {...props}
  />
)
SheetFooter.displayName = 'SheetFooter'

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
}
