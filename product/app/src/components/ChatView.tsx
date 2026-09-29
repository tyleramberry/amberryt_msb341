import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { supabase, type Agent, type Conversation, type Message } from '../lib/supabase'
import { Avatar, GroupAvatar } from './Avatar'
import { formatStamp } from '../lib/time'

const STAMP_GAP_MS = 15 * 60 * 1000
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

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
  const [typing, setTyping] = useState<Agent | null>(null)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const members = conversation.agentIds.map((id) => agentsById[id]).filter(Boolean).sort((a, b) => a.sort - b.sort)
  const isGroup = conversation.kind === 'group'

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
    return () => { live = false }
  }, [conversation.id])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, typing])

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
      setSendError('Not delivered. Tap send to try again.')
      setDraft(body)
      setSending(false)
      return
    }
    setMessages((m) => [...m, mine])

    // Agent replies are written by the database trigger in the same insert.
    // Reveal them one at a time with a typing indicator so a group feels like a group.
    const { data: replies } = await supabase
      .from('messages')
      .select('id, conversation_id, sender, agent_id, body, created_at')
      .eq('conversation_id', conversation.id)
      .eq('sender', 'agent')
      .gt('created_at', mine.created_at)
      .order('created_at')
    for (const reply of replies ?? []) {
      setTyping(agentsById[reply.agent_id ?? ''] ?? null)
      await wait(650 + Math.min(reply.body.length * 8, 900))
      setTyping(null)
      setMessages((m) => [...m, reply])
      await wait(150)
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
      <header className="chat-header">
        <button className="back" onClick={onBack} aria-label="Back">
          <svg viewBox="0 0 12 20" width="12" height="20"><path d="M10 2 2 10l8 8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div className="chat-header-center">
          <GroupAvatar agents={members} size={40} />
          <span className="chat-title">{conversation.title}</span>
          <span className="chat-sub">{isGroup ? members.map((a) => a.name).join(', ') : members[0]?.role}</span>
        </div>
        <span className="back-spacer" />
      </header>

      <div className="messages">
        {loading && <div className="muted center pad">Loading…</div>}
        {messages.map((m, i) => {
          const prev = messages[i - 1]
          const next = messages[i + 1]
          const agent = m.agent_id ? agentsById[m.agent_id] : undefined
          const showStamp = !prev || new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() > STAMP_GAP_MS
          const sameAsPrev = prev && !showStamp && prev.sender === m.sender && prev.agent_id === m.agent_id
          const sameAsNext = next && next.sender === m.sender && next.agent_id === m.agent_id &&
            new Date(next.created_at).getTime() - new Date(m.created_at).getTime() <= STAMP_GAP_MS
          const mine = m.sender === 'user'
          return (
            <div key={m.id}>
              {showStamp && <div className="stamp">{formatStamp(m.created_at)}</div>}
              {isGroup && !mine && !sameAsPrev && <div className="sender-name">{agent?.name}</div>}
              <div className={`msg-row ${mine ? 'mine' : 'theirs'} ${sameAsNext ? 'grouped' : 'tail'}`}>
                {isGroup && !mine && (sameAsNext ? <span className="avatar-gap" /> : <Avatar agent={agent} size={28} />)}
                <div className="bubble">{m.body}</div>
              </div>
            </div>
          )
        })}
        {typing && (
          <>
            {isGroup && <div className="sender-name">{typing.name}</div>}
            <div className="msg-row theirs tail">
              {isGroup && <Avatar agent={typing} size={28} />}
              <div className="bubble typing" aria-label={`${typing.name} is typing`}><i /><i /><i /></div>
            </div>
          </>
        )}
        {sendError && <div className="send-error">{sendError}</div>}
        <div ref={endRef} />
      </div>

      <form className="composer" onSubmit={send}>
        <textarea
          ref={inputRef}
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          placeholder={isGroup ? 'Message the group' : `Message ${members[0]?.name ?? ''}`}
          aria-label="Message"
        />
        <button type="submit" className="send" disabled={!draft.trim() || sending} aria-label="Send">
          <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </form>
    </section>
  )
}
