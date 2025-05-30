'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface UserNavProps {
  user: {
    id: string
    email?: string
    full_name?: string
    avatar_url?: string
  }
}

export function UserNav({ user }: UserNavProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-x-4 p-4 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url} alt={user.full_name || ''} />
            <AvatarFallback>
              {user.full_name
                ?.split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase() || user.email?.[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="sr-only">Your profile</span>
          <span aria-hidden="true">{user.full_name || user.email}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.full_name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={() => router.push('/dashboard/settings')}
        >
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={handleSignOut}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
