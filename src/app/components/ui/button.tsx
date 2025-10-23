'use client'

// ** React Types
import { ButtonHTMLAttributes, ReactNode } from 'react'

// ** Third-Party Libraries
import cn from 'classnames'
import { FaSpinner } from 'react-icons/fa'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
  variant?: 'black' | 'red' | 'yellow'
  loading?: boolean
  icon?: ReactNode
}

const variantClasses = {
  black: 'bg-black text-white hover:bg-gray-800',
  red: 'bg-red-600 text-white hover:bg-red-700',
  yellow: 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100'
}

export function Button({ children, variant = 'black', loading = false, icon, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex w-auto items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap',
        variantClasses[variant],
        props.className
      )}
      disabled={props.disabled || loading}
      onClick={e => {
        e.stopPropagation()
        props.onClick?.(e)
      }}
    >
      {loading ? (
        <FaSpinner className='animate-spin' />
      ) : (
        <>
          {icon && <span className='flex items-center'>{icon}</span>}
          {children && <span>{children}</span>}
        </>
      )}
    </button>
  )
}
