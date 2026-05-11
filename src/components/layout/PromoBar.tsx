'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type Props = {
  messages: string[]
  isDropLive?: boolean
  intervalMs?: number
}

export function PromoBar({
  messages,
  isDropLive = false,
  intervalMs = 4000,
}: Props) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent((i) => (i + 1) % messages.length)
  }, [messages.length])

  const prev = useCallback(() => {
    setCurrent((i) => (i - 1 + messages.length) % messages.length)
  }, [messages.length])

  useEffect(() => {
    if (paused || messages.length <= 1) return
    const id = setInterval(next, intervalMs)
    return () => clearInterval(id)
  }, [next, paused, intervalMs, messages.length])

  if (messages.length === 0) return null

  return (
    <div
      role="marquee"
      aria-live="polite"
      aria-label="Información de la tienda"
      className={cn(
        'relative flex h-9 items-center justify-center',
        'border-b border-white/[0.08]',
        isDropLive
          ? 'bg-[var(--accent-blood)]'
          : 'bg-black',
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {messages.length > 1 && (
        <button
          onClick={prev}
          aria-label="Mensaje anterior"
          className="absolute left-3 text-white/50 hover:text-white transition-colors duration-[120ms] focus:outline-none"
        >
          <ChevronLeft size={14} aria-hidden="true" />
        </button>
      )}

      <p className="font-heading text-[10px] font-medium uppercase tracking-widest text-white px-8 text-center animate-fade-in">
        {messages[current]}
      </p>

      {messages.length > 1 && (
        <button
          onClick={next}
          aria-label="Siguiente mensaje"
          className="absolute right-3 text-white/50 hover:text-white transition-colors duration-[120ms] focus:outline-none"
        >
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
