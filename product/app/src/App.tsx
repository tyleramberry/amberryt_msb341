import { useCallback, useEffect, useMemo, useState } from 'react'
import { ensureSession, loadConversations, supabase, type Agent, type Conversation } from './lib/supabase'
import { Sidebar, type Tab, type WorkspaceSection } from './components/Sidebar'
import { ChatView } from './components/ChatView'
import { Workspace } from './components/Workspace'
import { NewChat } from './components/NewChat'

export default function App() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [tab, setTab] = useState<Tab>('group')
  const [selected, setSelected] = useState<Record<'group' | 'direct', string | null>>({ group: null, direct: null })
  const [section, setSection] = useState<WorkspaceSection>('skills')
  const [composing, setComposing] = useState(false)
  // On phones the sidebar and detail pane are separate screens.
  const [showDetail, setShowDetail] = useState(false)

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
        setSelected({
          group: convs.find((c) => c.kind === 'group')?.id ?? null,
          direct: convs.find((c) => c.kind === 'direct')?.id ?? null,
        })
        setReady(true)
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      }
    })()
  }, [])

  const agentsById = useMemo(() => Object.fromEntries(agents.map((a) => [a.id, a])), [agents])
  const current = tab === 'workspace' ? null : conversations.find((c) => c.id === selected[tab]) ?? null

  const openConversation = (id: string) => {
    if (tab === 'workspace') return
    setSelected((s) => ({ ...s, [tab]: id }))
    setShowDetail(true)
  }

  const created = async (conv: Conversation) => {
    setComposing(false)
    await refresh()
    setSelected((s) => ({ ...s, [conv.kind]: conv.id }))
    setShowDetail(true)
  }

  if (error) return <div className="splash">Couldn't start Homeroom: {error}</div>
  if (!ready) return <div className="splash"><div className="spinner" />Opening Homeroom…</div>

  return (
    <div className={`app ${showDetail ? 'show-detail' : ''}`}>
      <Sidebar
        tab={tab}
        onTab={(t) => { setTab(t); setShowDetail(false) }}
        conversations={conversations.filter((c) => c.kind === tab)}
        agentsById={agentsById}
        selectedId={tab === 'workspace' ? null : selected[tab]}
        onSelect={openConversation}
        section={section}
        onSection={(s) => { setSection(s); setShowDetail(true) }}
        onCompose={() => setComposing(true)}
      />
      <main className="detail">
        {tab === 'workspace' ? (
          <Workspace section={section} agents={agents} onBack={() => setShowDetail(false)} />
        ) : current ? (
          <ChatView
            key={current.id}
            conversation={current}
            agentsById={agentsById}
            onBack={() => setShowDetail(false)}
            onSent={refresh}
          />
        ) : (
          <div className="empty">
            <p>No {tab === 'group' ? 'group chats' : 'chats'} yet.</p>
            <button className="pill" onClick={() => setComposing(true)}>Start one</button>
          </div>
        )}
      </main>
      {composing && tab !== 'workspace' && (
        <NewChat kind={tab} agents={agents} onClose={() => setComposing(false)} onCreated={created} />
      )}
    </div>
  )
}
