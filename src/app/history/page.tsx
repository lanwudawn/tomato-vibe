import { getHistorySessions } from '@/lib/supabase/server-sessions'
import { redirect } from 'next/navigation'
import { HistoryView } from '@/components/HistoryView'

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getSessions(dateFilter?: string) {
  const sessions = await getHistorySessions(dateFilter)

  if (sessions === null) {
    redirect('/')
  }

  return sessions
}

export default async function HistoryPage(props: Props) {
  const searchParams = await props.searchParams
  const dateStr = typeof searchParams.date === 'string' ? searchParams.date : undefined

  const sessions = await getSessions(dateStr)

  return <HistoryView sessions={sessions} />
}
