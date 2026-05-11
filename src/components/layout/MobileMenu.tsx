'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, Instagram, Music2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { KillerLogo } from './KillerLogo'

const NAV_LINKS = [
  { label: 'DROPS',       href: '/drops' },
  { label: 'MEMBERS BOX', href: '/members-box' },
  { label: 'JACKETS',     href: '/collections/jackets' },
  { label: 'HOODIES',     href: '/collections/hoodies' },
  { label: 'TEES',        href: '/collections/tees' },
  { label: 'PANTS',       href: '/collections/pants' },
  { label: 'ACCESORIOS',  href: '/collections/accessories' },
  { label: 'GORRAS',      href: '/collections/caps' },
  { label: 'LOOKBOOK',    href: '/squad' },
  { label: 'SOBRE KILLERCLO', href: '/about' },
]

type Props = {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: Props) {
  const pathname = usePathname()

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on navigation
  useEffect(() => {
    onClose()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación"
      className={cn(
        'fixed inset-0 z-[350] flex flex-col',
        'bg-black',
        'animate-slide-in-left',
      )}
    >
      {/* Header */}
      <div className="flex h-[60px] items-center justify-between px-4 border-b border-white/[0.08] shrink-0">
        <KillerLogo />
        <button
          onClick={onClose}
          aria-label="Cerrar menú"
          className="flex h-10 w-10 items-center justify-center text-white hover:text-white/60 transition-colors duration-[120ms] focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
        >
          <X size={22} aria-hidden="true" />
        </button>
      </div>

      {/* Nav links */}
      <nav
        aria-label="Navegación principal"
        className="flex-1 overflow-y-auto py-8 px-6"
      >
        <ul className="flex flex-col gap-1" role="list">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href ||
              (link.href !== '/' && pathname.startsWith(link.href))

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'flex items-center py-3',
                    'font-heading font-medium uppercase text-2xl tracking-wider',
                    'transition-colors duration-[120ms]',
                    'focus:outline-none focus-visible:underline',
                    isActive
                      ? 'text-[var(--accent-blood)]'
                      : 'text-white hover:text-white/60',
                  )}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-white/[0.08] px-6 py-6">
        {/* Social */}
        <div className="flex items-center gap-4 mb-4">
          <a
            href="https://instagram.com/ivankillerclo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="KILLERCLO en Instagram"
            className="text-[var(--muted)] hover:text-white transition-colors duration-[120ms]"
          >
            <Instagram size={20} aria-hidden="true" />
          </a>
          <a
            href="https://tiktok.com/@killerclo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="KILLERCLO en TikTok"
            className="text-[var(--muted)] hover:text-white transition-colors duration-[120ms]"
          >
            <Music2 size={20} aria-hidden="true" />
          </a>
        </div>
        <p className="font-heading text-[10px] uppercase tracking-widest text-[var(--muted)]">
          KILLER CLUB SINCE 1988
        </p>
      </div>
    </div>
  )
}
