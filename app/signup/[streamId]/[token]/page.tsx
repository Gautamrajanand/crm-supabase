import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'
import SignUpForm from './signup-form'

export default async function SignUpPage({
  params: { streamId, token },
}: {
  params: { streamId: string; token: string }
}) {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Get the invite
  const { data: invites, error: inviteError } = await supabase
    .from('revenue_stream_invites')
    .select('email, role')
    .eq('token', token)
    .eq('stream_id', streamId)
    .is('accepted_at', null)
    .gte('expires_at', new Date().toISOString())

  if (inviteError) {
    console.error('Error getting invite:', inviteError)
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-4 text-xl text-red-500">❌</div>
          <p className="text-red-500">Error checking invite</p>
        </div>
      </div>
    )
  }

  if (!invites || invites.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-4 text-xl text-red-500">❌</div>
          <p className="text-red-500">Invalid or expired invite link</p>
        </div>
      </div>
    )
  }

  const invite = invites[0]

  return <SignUpForm email={invite.email} streamId={streamId} token={token} />
}
