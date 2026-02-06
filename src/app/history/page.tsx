import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HistoryView } from '@/components/HistoryView'

async function getRecentSessions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: sessions } = await supabase
    .from('pomodoro_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('completed', true)
    .order('started_at', { ascending: false })
    .limit(50)

  return sessions || []
}

export default async function HistoryPage() {
  const sessions = await getRecentSessions()

  return <HistoryView sessions={sessions} />
}
