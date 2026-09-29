import React from 'react'
import { cn } from '../../lib/utils'

export function Badge({ className, variant = 'default', children, ...props }) {
  const variants = {
    default: 'bg-blue-50 text-blue-700 border-blue-200/80',
    primary: 'bg-blue-600 text-white border-transparent',
    secondary: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
    destructive: 'bg-rose-50 text-rose-700 border-rose-200/80',
    outline: 'border-slate-300 text-slate-700 bg-transparent',
    medical: 'bg-teal-50 text-teal-700 border-teal-200/80',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
