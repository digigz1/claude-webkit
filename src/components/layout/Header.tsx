'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, Search, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useCartStore, selectTotalItems } from '@/lib/cart/store'
import { KillerLogo } from './KillerLogo'
import { MobileMenu } from './MobileMenu'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const totalItems = useCartStore(selectTotalItems)
  const openCart = useCartStore((s) => s.openCart)

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-[200]',
          'flex h-[60px] items-center',
          'bg-black/95 backdrop-blur-sm',
          'border-b border-white/[0.08]',
          'px-4',
        )}
      >
        {/* Left — hamburger */}
        <div className="flex items-center w-1/3">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="flex h-10 w-10 items-center justify-center text-white hover:text-white/60 transition-colors duration-[120ms] focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40 lg:hidden"
          >
            <MenuIcon aria-hidden="true" />
          </button>

          {/* Desktop nav — shown on lg+ */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Navegación principal desktop">
            <Link
              href="/drops"
              className="font-heading text-[11px] font-medium uppercase tracking-widest text-[var(--muted)] hover:text-white transition-colors duration-[120ms]"
            >
              Drops
            </Link>
            <Link
              href="/members-box"
              className="font-heading text-[11px] font-medium uppercase tracking-widest text-[var(--muted)] hover:text-white transition-colors duration-[120ms]"
            >
              Members
            </Link>
          </nav>
        </div>

        {/* Center — logo */}
        <div className="flex items-center justify-center w-1/3">
          <KillerLogo />
        </div>

        {/* Right — search + cart */}
        <div className="flex items-center justify-end w-1/3 gap-1">
          <Link
            href="/search"
            aria-label="Buscar productos"
            className="flex h-10 w-10 items-center justify-center text-white hover:text-white/60 transition-colors duration-[120ms] focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
          >
            <Search size={18} aria-hidden="true" />
          </Link>

          <button
            onClick={openCart}
            aria-label={`Carrito (${totalItems} ${totalItems === 1 ? 'artículo' : 'artículos'})`}
            className="relative flex h-10 w-10 items-center justify-center text-white hover:text-white/60 transition-colors duration-[120ms] focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
          >
            <ShoppingBag size={18} aria-hidden="true" />
            {totalItems > 0 && (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute -top-0.5 -right-0.5',
                  'flex h-4 w-4 items-center justify-center',
                  'bg-[var(--accent-blood)] text-white',
                  'font-mono text-[9px] font-medium leading-none',
                  'rounded-full',
                )}
              >
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <div id="mobile-menu">
        <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
    </>
  )
}

// Custom hamburger icon (3 lines)
function MenuIcon(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      width="22"
      height="16"
      viewBox="0 0 22 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <line x1="0" y1="1" x2="22" y2="1" stroke="white" strokeWidth="1.5" />
      <line x1="0" y1="8" x2="22" y2="8" stroke="white" strokeWidth="1.5" />
      <line x1="0" y1="15" x2="22" y2="15" stroke="white" strokeWidth="1.5" />
    </svg>
  )
}
