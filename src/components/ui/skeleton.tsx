import { cn } from '@/lib/utils/cn'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse bg-white/[0.06] rounded-none',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
