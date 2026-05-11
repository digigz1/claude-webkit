import Link from 'next/link'
import { Instagram, Music2, Youtube } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { KillerLogo } from './KillerLogo'
import { FooterNewsletter } from './FooterNewsletter'

const LINKS = {
  TIENDA: [
    { label: 'Drops',        href: '/drops' },
    { label: 'Collections',  href: '/collections/jackets' },
    { label: 'Members Box',  href: '/members-box' },
    { label: 'Lookbook',     href: '/squad' },
    { label: 'Sobre nosotros', href: '/about' },
  ],
  SOPORTE: [
    { label: 'Envíos',         href: '/envios' },
    { label: 'Devoluciones',   href: '/devoluciones' },
    { label: 'Guía de tallas', href: '/tallas' },
    { label: 'Contacto',       href: '/contacto' },
    { label: 'FAQ',            href: '/faq' },
  ],
  LEGAL: [
    { label: 'Privacidad',     href: '/privacidad' },
    { label: 'Cookies',        href: '/cookies' },
    { label: 'Términos',       href: '/terminos' },
    { label: 'Aviso legal',    href: '/aviso-legal' },
  ],
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black border-t border-white/[0.08]">
      {/* Newsletter section */}
      <div className="px-6 py-16 lg:px-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="font-heading text-xs uppercase tracking-widest text-[var(--muted)] mb-3">
              ÚNETE AL KILLER CLUB
            </p>
            <h2 className="font-display text-4xl lg:text-5xl text-white mb-6">
              MEMBERS ONLY<br />SINCE 1988.
            </h2>
            <p className="text-[var(--muted)] text-sm leading-relaxed max-w-sm">
              Acceso anticipado a drops. Precios exclusivos de miembro.
              Ediciones limitadas que no salen a la venta general.
            </p>
          </div>
          <div className="lg:pt-16">
            <FooterNewsletter />
          </div>
        </div>
      </div>

      <Separator />

      {/* Links grid */}
      <div className="px-6 py-12 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <p className="font-heading text-[10px] font-medium uppercase tracking-widest text-[var(--muted)] mb-4">
                {section}
              </p>
              <ul className="flex flex-col gap-3" role="list">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-body text-sm text-white/70 hover:text-white transition-colors duration-[120ms]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social */}
          <div>
            <p className="font-heading text-[10px] font-medium uppercase tracking-widest text-[var(--muted)] mb-4">
              SOCIAL
            </p>
            <ul className="flex flex-col gap-3" role="list">
              <li>
                <a
                  href="https://instagram.com/ivankillerclo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-body text-sm text-white/70 hover:text-white transition-colors duration-[120ms]"
                >
                  <Instagram size={14} aria-hidden="true" />
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://tiktok.com/@killerclo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-body text-sm text-white/70 hover:text-white transition-colors duration-[120ms]"
                >
                  <Music2 size={14} aria-hidden="true" />
                  TikTok
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com/@killerclo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-body text-sm text-white/70 hover:text-white transition-colors duration-[120ms]"
                >
                  <Youtube size={14} aria-hidden="true" />
                  YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Separator />

      {/* Bottom bar */}
      <div className="px-6 py-8 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          {/* Large K logo */}
          <KillerLogo size="lg" />

          <p className="font-heading text-[10px] uppercase tracking-widest text-[var(--muted)] text-center">
            © {currentYear} KILLERCLO · KILLER CLUB SINCE 1988 · ESPAÑA
          </p>

          {/* Currency + payment methods */}
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-[var(--muted)]">EUR €</span>
            <span className="text-white/[0.08]">|</span>
            <span className="font-heading text-[10px] uppercase tracking-wider text-[var(--muted)]">
              Visa · MC · PayPal · SEPA · Klarna
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
