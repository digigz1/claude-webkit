'use client'

import { useState } from 'react'
import { toast } from '@/components/ui/toast'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function FooterNewsletter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'footer' }),
      })

      if (!res.ok) {
        const { error } = (await res.json()) as { error?: string }
        toast.error('Error al suscribirse', {
          description: error ?? 'Inténtalo de nuevo.',
        })
        return
      }

      setDone(true)
      setEmail('')
    } catch {
      toast.error('Error de conexión', {
        description: 'Inténtalo de nuevo.',
      })
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="py-2">
        <p className="font-heading text-sm uppercase tracking-wider text-white">
          BIENVENIDO AL KILLER CLUB.
        </p>
        <p className="text-[var(--muted)] text-sm mt-1">
          Recibirás el email de confirmación en breve.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 max-w-sm">
      <div className="flex gap-0">
        <label htmlFor="footer-email" className="sr-only">
          Tu email
        </label>
        <Input
          id="footer-email"
          type="email"
          variant="underline"
          placeholder="TU EMAIL"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="flex-1"
          aria-required="true"
        />
        <Button
          type="submit"
          size="sm"
          loading={loading}
          className="ml-4 shrink-0"
          aria-label="Unirse al Killer Club"
        >
          ENTRAR
        </Button>
      </div>
      <p className="text-[10px] text-[var(--muted)] leading-relaxed">
        Al suscribirte aceptas nuestra{' '}
        <a href="/privacidad" className="underline hover:text-white transition-colors">
          política de privacidad
        </a>
        . Sin spam.
      </p>
    </form>
  )
}
