import { motion } from 'framer-motion'

export default function Logo({ size = 'md', className = '', animated = true }) {
  const sizes = {
    sm: 'w-8 h-8 text-xl',
    md: 'w-10 h-10 text-2xl',
    lg: 'w-12 h-12 text-3xl',
    xl: 'w-16 h-16 text-4xl'
  }

  const LogoComponent = animated ? motion.div : 'div'
  const animationProps = animated ? {
    whileHover: { scale: 1.1, rotate: 5 },
    transition: { type: 'spring', stiffness: 300 }
  } : {}

  return (
    <LogoComponent
      className={`${sizes[size]} rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-background-dark shadow-lg shadow-primary/20 ${className}`}
      {...animationProps}
    >
      <span className="material-symbols-outlined font-bold">school</span>
    </LogoComponent>
  )
}

export function LogoWithText({ size = 'md', className = '', showTagline = false }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo size={size} />
      <div className="flex flex-col">
        <h1 className={`font-bold leading-tight tracking-tight text-white ${
          size === 'sm' ? 'text-lg' : 
          size === 'md' ? 'text-xl' : 
          size === 'lg' ? 'text-2xl' : 'text-3xl'
        }`}>
          Edu Buddy AI
        </h1>
        {showTagline && (
          <p className="text-text-secondary text-xs font-medium">Your Personal Study Partner</p>
        )}
      </div>
    </div>
  )
}