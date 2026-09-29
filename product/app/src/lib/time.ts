const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

export function formatListTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  if (sameDay(d, now)) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (sameDay(d, yesterday)) return 'Yesterday'
  return d.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: '2-digit' })
}

export function formatStamp(iso: string) {
  const d = new Date(iso)
  const day = sameDay(d, new Date()) ? 'Today' : d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
  return `${day} ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
}
