'use client'

import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/utils/supabase'
import { useState } from 'react'
import { User } from '@supabase/auth-helpers-nextjs'

interface UserNavProps {
  user: User
}

export function UserNav({ user }: UserNavProps) {
  const router = useRouter()
  const supabase = createBrowserSupabase()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200"
      >
        {user.email?.[0]?.toUpperCase() || 'U'}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="px-4 py-2">
            <p className="text-sm font-medium text-gray-900">User</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <div className="border-t border-gray-100" />
          <button
            onClick={handleSignOut}
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
