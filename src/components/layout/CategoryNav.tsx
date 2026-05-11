'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

const CATEGORIES = [
  { label: 'DROPS',       href: '/drops' },
  { label: 'MEMBERS BOX', href: '/members-box' },
  { label: 'JACKETS',     href: '/collections/jackets' },
  { label: 'HOODIES',     href: '/collections/hoodies' },
  { label: 'TEES',        href: '/collections/tees' },
  { label: 'PANTS',       href: '/collections/pants' },
  { label: 'ACCESORIOS',  href: '/collections/accessories' },
  { label: 'GORRAS',      href: '/collections/caps' },
  { label: 'LOOKBOOK',    href: '/squad' },
]

export function CategoryNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Categorías"
      className="relative border-b border-white/[0.08] bg-black"
    >
      {/* Scroll shadow right */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      <ul
        role="list"
        className="flex items-center overflow-x-auto scrollbar-hide h-12 px-4 gap-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {CATEGORIES.map((cat) => {
          const isActive =
            pathname === cat.href ||
            (cat.href !== '/drops' && cat.href !== '/members-box' && cat.href !== '/squad' &&
              pathname.startsWith(cat.href))

          return (
            <li key={cat.href} className="shrink-0">
              <Link
                href={cat.href}
                className={cn(
                  'relative flex items-center h-12 px-4',
                  'font-heading text-[11px] font-medium uppercase tracking-widest',
                  'transition-colors duration-[120ms] whitespace-nowrap',
                  'focus:outline-none focus-visible:underline',
                  isActive
                    ? 'text-white nav-active'
                    : 'text-[var(--muted)] hover:text-white',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {cat.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
