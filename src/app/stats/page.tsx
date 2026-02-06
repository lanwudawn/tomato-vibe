import { getFullStats } from '@/lib/supabase/server-sessions'
import { redirect } from 'next/navigation'
import { StatsView } from '@/components/StatsView'

async function getStats() {
  const stats = await getFullStats()

  if (!stats) {
    redirect('/')
  }

  return stats
}

export default async function StatsPage() {
  const stats = await getStats()

  return <StatsView stats={stats} />
}
