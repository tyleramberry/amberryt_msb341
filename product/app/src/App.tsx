import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ensureSession, loadConversations, supabase, type Agent, type Conversation } from './lib/supabase'
import { InboxIcon, SECTIONS, Sidebar, slug, type View } from './components/Sidebar'
import { ChatView } from './components/ChatView'
import { Workspace } from './components/Workspace'
import { NewChat } from './components/NewChat'
import { Glyph } from './components/Avatar'
import { formatListTime } from './lib/time'

type Theme = 'light' | 'dark'
const SEEN_KEY = 'hr-seen'

export default function App() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [view, setView] = useState<View>({ type: 'inbox' })
  const [composing, setComposing] = useState<'group' | 'direct' | null>(null)
  const [palette, setPalette] = useState(false)
  const [seen, setSeen] = useState<Record<string, string>>(() => JSON.parse(localStorage.getItem(SEEN_KEY) ?? '{}'))
  const [theme, setTheme] = useState<Theme>(() =>
    (localStorage.getItem('hr-theme') as Theme) ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
  // On phones the sidebar and detail pane are separate screens.
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('hr-theme', theme)
  }, [theme])

  const refresh = useCallback(async () => {
    setConversations(await loadConversations())
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        await ensureSession()
        const { data, error } = await supabase.from('agents').select('id, name, emoji, color, role, sort').order('sort')
        if (error) throw error
        setAgents(data)
        const convs = await loadConversations()
        setConversations(convs)
        const first = convs.find((c) => c.kind === 'group') ?? convs[0]
        if (first) setView({ type: 'conv', id: first.id })
        setReady(true)
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      }
    })()
  }, [])

  // Mark the open conversation as read.
  const openId = view.type === 'conv' ? view.id : null
  const openLast = conversations.find((c) => c.id === openId)?.last?.created_at
  useEffect(() => {
    if (!openId || !openLast) return
    setSeen((s) => {
      if (s[openId] === openLast) return s
      const next = { ...s, [openId]: openLast }
      localStorage.setItem(SEEN_KEY, JSON.stringify(next))
      return next
    })
  }, [openId, openLast])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette((p) => !p) }
      if (e.key === 'Escape') setPalette(false)
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [])

  const agentsById = useMemo(() => Object.fromEntries(agents.map((a) => [a.id, a])), [agents])
  const channels = conversations.filter((c) => c.kind === 'group')
  const dms = conversations.filter((c) => c.kind === 'direct')
  const unread = useMemo(() => new Set(
    conversations.filter((c) => c.last && seen[c.id] !== c.last.created_at && c.id !== openId).map((c) => c.id),
  ), [conversations, seen, openId])

  const go = (v: View) => { setView(v); setShowDetail(true); setPalette(false) }
  const current = view.type === 'conv' ? conversations.find((c) => c.id === view.id) ?? null : null

  const created = async (conv: Conversation) => {
    setComposing(null)
    await refresh()
    go({ type: 'conv', id: conv.id })
  }

  if (error) return <div className="splash">Couldn't start Homeroom: {error}</div>
  if (!ready) return <div className="splash"><span className="mark" />Opening Homeroom</div>

  const convName = (c: Conversation) => c.kind === 'group' ? `#${slug(c.title)}` : agentsById[c.agentIds[0]]?.name ?? c.title

  return (
    <div className={`app ${showDetail ? 'show-detail' : ''}`}>
      <Sidebar
        view={view}
        onView={go}
        channels={channels}
        dms={dms}
        agentsById={agentsById}
        unread={unread}
        onCompose={setComposing}
        onSearch={() => setPalette(true)}
        theme={theme}
        onTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />
      <main className="detail">
        {view.type === 'section' ? (
          <Workspace section={view.section} agents={agents} onBack={() => setShowDetail(false)} />
        ) : current ? (
          <ChatView key={current.id} conversation={current} agentsById={agentsById} onBack={() => setShowDetail(false)} onSent={refresh} />
        ) : (
          <section className="chat">
            <header className="top">
              <button className="ibtn back" onClick={() => setShowDetail(false)} aria-label="Back">
                <svg className="i" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" /></svg>
              </button>
              <h1>{InboxIcon}<span>Inbox</span></h1>
              <span className="topic">Latest from every channel and DM</span>
            </header>
            <div className="feed"><div className="feed-inner">
              <section className="intro">
                <div className="eyebrow">Inbox</div>
                <h2>{unread.size ? <>{unread.size} new <em>since you last looked.</em></> : <>All caught up<em>.</em></>}</h2>
              </section>
              <div className="inbox">
                {conversations.map((c) => {
                  const members = c.agentIds.map((id) => agentsById[id]).filter(Boolean)
                  return (
                    <button key={c.id} className={`inbox-row ${unread.has(c.id) ? 'unread' : ''}`} onClick={() => go({ type: 'conv', id: c.id })}>
                      {c.kind === 'group' ? <span className="hash-lg">#</span> : <Glyph agent={members[0]} size="lg" />}
                      <span className="ir-text">
                        <span className="ir-top"><b>{convName(c)}</b><time>{c.last ? formatListTime(c.last.created_at) : ''}</time></span>
                        <span className="ir-prev">{c.last?.body ?? 'No messages yet'}</span>
                      </span>
                      {unread.has(c.id) && <span className="dot" />}
                    </button>
                  )
                })}
              </div>
            </div></div>
          </section>
        )}
      </main>

      {composing && (
        <NewChat kind={composing} agents={agents} onClose={() => setComposing(null)} onCreated={created} />
      )}
      {palette && (
        <Palette
          onClose={() => setPalette(false)}
          items={[
            { group: 'Go to', label: 'Inbox', icon: InboxIcon, run: () => go({ type: 'inbox' }) },
            ...channels.map((c) => ({ group: 'Channels', label: `#${slug(c.title)}`, icon: <span className="hash">#</span>, run: () => go({ type: 'conv', id: c.id }) })),
            ...dms.map((c) => ({ group: 'Direct messages', label: convName(c), icon: <Glyph agent={agentsById[c.agentIds[0]]} />, run: () => go({ type: 'conv', id: c.id }) })),
            ...SECTIONS.map((s) => ({ group: 'Workspace', label: s.label, hint: s.blurb, icon: s.icon, run: () => go({ type: 'section', section: s.id }) })),
            { group: 'Actions', label: 'New channel', icon: <span className="hash">+</span>, run: () => { setPalette(false); setComposing('group') } },
            { group: 'Actions', label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`, icon: <span className="hash">◐</span>, run: () => { setTheme((t) => (t === 'dark' ? 'light' : 'dark')); setPalette(false) } },
          ]}
        />
      )}
    </div>
  )
}

type Item = { group: string; label: string; hint?: string; icon: React.ReactNode; run: () => void }

function Palette({ items, onClose }: { items: Item[]; onClose: () => void }) {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { inputRef.current?.focus() }, [])
  const shown = items.filter((i) => (i.label + ' ' + (i.hint ?? '')).toLowerCase().includes(q.toLowerCase()))
  const idx = Math.min(sel, Math.max(shown.length - 1, 0))

  return (
    <div className="scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="pal" role="dialog" aria-label="Jump to">
        <input
          ref={inputRef}
          value={q}
          placeholder="Jump to a channel, agent, or setting…"
          onChange={(e) => { setQ(e.target.value); setSel(0) }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, shown.length - 1)) }
            if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)) }
            if (e.key === 'Enter') shown[idx]?.run()
          }}
        />
        <div className="pal-list">
          {shown.map((it, i) => (
            <div key={it.group + it.label}>
              {(i === 0 || shown[i - 1].group !== it.group) && <div className="grp">{it.group}</div>}
              <button className={`opt ${i === idx ? 'sel' : ''}`} onMouseEnter={() => setSel(i)} onClick={it.run}>
                {it.icon}<span>{it.label}</span>{it.hint && <span className="d">{it.hint}</span>}
                {i === idx && <kbd>↵</kbd>}
              </button>
            </div>
          ))}
          {shown.length === 0 && <p className="muted tiny pad-x">Nothing matches.</p>}
        </div>
        <div className="foot"><span>↑↓ move</span><span>↵ open</span><span>esc close</span></div>
      </div>
    </div>
  )
}
