import React from 'react'

interface LogoProps {
  className?: string
  collapsed?: boolean
}

export function Logo({ className = '', collapsed = false }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo icon - always visible */}
      <svg
        className="h-6 w-6 text-orange-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>

      {/* Logo text - only visible when not collapsed */}
      <span
        className={`ml-2 text-xl font-light tracking-widest text-orange-500 transition-all duration-300 ${
          collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
        }`}
      >
        CRM
      </span>
    </div>
  )
}
