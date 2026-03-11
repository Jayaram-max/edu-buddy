import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-background-dark',
        secondary: 'border-transparent bg-surface-dark text-text-secondary',
        destructive: 'border-transparent bg-red-500/10 text-red-400',
        outline: 'border-border-dark text-text-secondary',
        success: 'border-transparent bg-green-500/10 text-green-400',
        warning: 'border-transparent bg-yellow-500/10 text-yellow-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
