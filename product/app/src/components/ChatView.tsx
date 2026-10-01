import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { supabase, type Agent, type Conversation, type Message } from '../lib/supabase'
import { Glyph, GlyphStack } from './Avatar'
import { slug } from './Sidebar'

const GROUP_GAP_MS = 5 * 60 * 1000
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
const clock = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
const dayLabel = (iso: string) => {
  const d = new Date(iso)
  const now = new Date()
  const y = new Date(now); y.setDate(now.getDate() - 1)
  if (d.toDateString() === now.toDateString()) return 'Today'
  if (d.toDateString() === y.toDateString()) return 'Yesterday'
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
}

type Props = {
  conversation: Conversation
  agentsById: Record<string, Agent>
  onBack: () => void
  onSent: () => void
}

export function ChatView({ conversation, agentsById, onBack, onSent }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [thinking, setThinking] = useState<Agent | null>(null)
  const [streaming, setStreaming] = useState<{ id: string; shown: number } | null>(null)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const feedRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const members = conversation.agentIds.map((id) => agentsById[id]).filter(Boolean).sort((a, b) => a.sort - b.sort)
  const isChannel = conversation.kind === 'group'
  const dmAgent = isChannel ? undefined : members[0]
  const name = isChannel ? slug(conversation.title) : dmAgent?.name ?? conversation.title

  useEffect(() => {
    let live = true
    supabase
      .from('messages')
      .select('id, conversation_id, sender, agent_id, body, created_at')
      .eq('conversation_id', conversation.id)
      .order('created_at')
      .then(({ data }) => {
        if (!live) return
        setMessages(data ?? [])
        setLoading(false)
      })
    inputRef.current?.focus()
    return () => { live = false }
  }, [conversation.id])

  useEffect(() => {
    const el = feedRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, thinking, streaming])

  async function send(e?: FormEvent) {
    e?.preventDefault()
    const body = draft.trim()
    if (!body || sending) return
    setSending(true)
    setSendError(null)
    setDraft('')

    const { data: mine, error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversation.id, sender: 'user', body })
      .select('id, conversation_id, sender, agent_id, body, created_at')
      .single()
    if (error || !mine) {
      setSendError('Not delivered. Press send to try again.')
      setDraft(body)
      setSending(false)
      return
    }
    setMessages((m) => [...m, mine])

    // Agent replies are written by the database trigger in the same insert.
    // Reveal each one: a thinking line, then the text streams in.
    const { data: replies } = await supabase
      .from('messages')
      .select('id, conversation_id, sender, agent_id, body, created_at')
      .eq('conversation_id', conversation.id)
      .eq('sender', 'agent')
      .gt('created_at', mine.created_at)
      .order('created_at')
    for (const reply of replies ?? []) {
      setThinking(agentsById[reply.agent_id ?? ''] ?? null)
      await wait(700)
      setThinking(null)
      setStreaming({ id: reply.id, shown: 0 })
      setMessages((m) => [...m, reply])
      // Time-based so a throttled background tab jumps ahead instead of stalling.
      const duration = Math.min(1400, reply.body.length * 12)
      const start = performance.now()
      for (;;) {
        const t = (performance.now() - start) / duration
        if (t >= 1) break
        setStreaming({ id: reply.id, shown: Math.ceil(reply.body.length * t) })
        await wait(16)
      }
      setStreaming(null)
      await wait(120)
    }
    setSending(false)
    onSent()
    inputRef.current?.focus()
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      send()
    }
  }

  return (
    <section className="chat">
      <header className="top">
        <button className="ibtn back" onClick={onBack} aria-label="Back">
          <svg className="i" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <h1>{isChannel ? <span className="hash">#</span> : <Glyph agent={dmAgent} />}<span>{name}</span></h1>
        <span className="topic">{isChannel ? members.map((a) => a.name).join(', ') : dmAgent?.role}</span>
        <div className="right">{isChannel && <GlyphStack agents={members} />}</div>
      </header>

      <div className="feed" ref={feedRef}>
        <div className="feed-inner">
          <section className="intro">
            <div className="eyebrow">{isChannel ? `Channel · ${members.length} agents` : 'Direct message'}</div>
            <h2>{isChannel ? <>{name} <em>knows the rubric.</em></> : <>{name}<em>.</em></>}</h2>
            <p>{isChannel
              ? `${members.map((a) => a.name).join(', ')} answer here.`
              : dmAgent?.role}</p>
          </section>

          {loading && <p className="muted tiny">Loading…</p>}
          {messages.map((m, i) => {
            const prev = messages[i - 1]
            const newDay = !prev || new Date(prev.created_at).toDateString() !== new Date(m.created_at).toDateString()
            const grouped = !!prev && !newDay && prev.sender === m.sender && prev.agent_id === m.agent_id &&
              new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() < GROUP_GAP_MS
            const agent = m.agent_id ? agentsById[m.agent_id] : undefined
            const isStreaming = streaming?.id === m.id
            const text = isStreaming ? m.body.slice(0, streaming.shown) : m.body
            return (
              <div key={m.id}>
                {newDay && <div className="day">{dayLabel(m.created_at)}</div>}
                <article className={`m ${grouped ? 'grouped' : ''}`}>
                  <div className="gutter">
                    {grouped
                      ? <time className="hover-time">{clock(m.created_at)}</time>
                      : m.sender === 'user' ? <span className="me-av">You</span> : <Glyph agent={agent} size="lg" />}
                  </div>
                  <div className="content">
                    {!grouped && (
                      <div className="hd">
                        <b>{m.sender === 'user' ? 'You' : agent?.name}</b>
                        {m.sender === 'agent' && <span className="role">agent</span>}
                        <time>{clock(m.created_at)}</time>
                      </div>
                    )}
                    <div className="body">{text}{isStreaming && <span className="caret" />}</div>
                  </div>
                </article>
              </div>
            )
          })}
          {thinking && (
            <div className="thinking"><Glyph agent={thinking} /><span className="shimmer">{thinking.name} is thinking…</span></div>
          )}
          {sendError && <div className="send-error">{sendError}</div>}
        </div>
      </div>

      <form className="composer" onSubmit={send}>
        <div className="box">
          <textarea
            ref={inputRef}
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            placeholder={isChannel ? `Message #${name}` : `Message ${name}`}
            aria-label="Message"
          />
          <div className="box-ft">
            <span className="muted tiny">{isChannel ? `${members.length} agents will reply` : `${name} will reply`}</span>
            <button type="submit" className="send" disabled={!draft.trim() || sending} aria-label="Send">
              <svg className="i" viewBox="0 0 24 24" style={{ strokeWidth: 2 }}><path d="M12 19V5M6 11l6-6 6 6" /></svg>
            </button>
          </div>
        </div>
        <div className="hint"><span><b>↵</b> send</span><span><b>⇧↵</b> new line</span><span><b>⌘K</b> jump</span></div>
      </form>
    </section>
  )
}
