import React from 'react'
import { cn } from '../../lib/utils'

export function Progress({ value = 0, max = 100, className, indicatorClassName }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div
      className={cn(
        'relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100',
        className
      )}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className={cn(
          'h-full bg-blue-600 transition-all duration-300 ease-in-out rounded-full',
          indicatorClassName
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
