import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

type Props = {
  className?: string
  size?: 'sm' | 'default' | 'lg'
  asLink?: boolean
}

const sizeMap = {
  sm:      'text-lg',
  default: 'text-2xl',
  lg:      'text-4xl',
}

export function KillerLogo({ className, size = 'default', asLink = true }: Props) {
  const mark = (
    <span
      className={cn(
        'font-display block leading-none text-white',
        sizeMap[size],
        className,
      )}
      style={{ height: size === 'default' ? 32 : undefined }}
      aria-label="KILLERCLO"
    >
      KILLERCLO
    </span>
  )

  if (!asLink) return mark

  return (
    <Link
      href="/"
      className="focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
      aria-label="KILLERCLO — inicio"
    >
      {mark}
    </Link>
  )
}
